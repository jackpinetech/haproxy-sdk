const _Utils = require('./_utils');

/**
 * This module provides a class, which is used within haproxy-sdk for creating a
 * object to work with a frontend. This object is associated only with a single
 * HAProxy process.
 *
 * @typedef {Object} _Frontend
 * @type {_HAProxyProcess} hap_process The HAProxy process
 * @type {string} _name The name of the frontend
 * @type {number} hap_process_nb The process number of the HAProxy process
 * @type {string} _iid The unique proxy id of the frontend
 */
class _Frontend {
  /**
   * Class for interacting with a frontend in one HAProxy.
   *
   * @param {_HAProxyProcess} hap_process a {@link _HAProxyProcess} object.
   * @param {string} name frontend name
   * @param {string} iid unique proxy id of the frontend
   */
  constructor(hap_process, name, iid) {
    this.hap_process = hap_process;
    this._name = name;
    this.hap_process_nb = this.hap_process.process_nb;
    this._iid = iid;
  }

  /**
   * Return a string which is the name of the frontend.
   *
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * Return proxy ID.
   *
   * @returns {Promise<string>}
   */
  async iid() {
    return this.statsData().then(value => {
      this._iid = value.get('iid');
      return this._iid;
    });
  }

  /**
   * Return the process number of the HAProxy process.
   *
   * @returns {Promise<number>}
   */
  async processNumber() {
    return this.hap_process_nb.then(hap_process_nb => parseInt(hap_process_nb, 10));
  }

  /**
   * Send command to HAProxy.
   *
   * @param {string} cmd command to send
   * @returns {Promise<string>} the output of the command
   */
  async command(cmd) {
    return this.hap_process.command(cmd);
  }

  /**
   * Return a frontend metric.
   *
   * @param {string} name
   * @returns {Promise<string>}
   */
  async metric(name) {
    return this.statsData().then(value => value.get(name));
  }

  /**
   * Build dictionary for all statistics reported by HAProxy.
   *
   * @returns {Promise<object>} a dictionary with statistics
   */
  async stats() {
    return this.statsData().then(value =>
      _Utils.dict(_Utils.zip(value._heads, value._parts))
    );
  }

  /**
   * Return stats data.
   *
   * HAProxy assigns unique ids to each object during the startup.
   * The id can change when configuration changes, objects order
   * is reshuffled or additions/removals take place. In those cases
   * the id we store at the instantiation of the object may reference
   * to another object or even to non-existent object when
   * configuration takes places afterwards.
   *
   * The technique we use is quite simple. When an object is created
   * we store the name and the id. In order to detect if iid is changed,
   * we simply send a request to fetch data only for the given iid and
   * check if the current id points to an object of the same type
   * (frontend, backend, server) which has the same name.
   *
   * @returns {Promise<_CSVLine>}
   */
  async statsData() {
    // Fetch data using the last known iid
    try {
      return this.hap_process.frontendsStats(this._iid).then(stats => stats[this.name]);
    } catch (e) {
      // A lookup on HAProxy with the current id doesn't return
      // an object with our name.
      // Most likely object got different id due to a reshuffle in conf.
      // Thus retrieve all objects to get latest data for the object.
      try {
        // This will basically request all object of the type
        return this.hap_process.frontendsStats().then(stats => stats[this.name]);
      } catch (e) {}
    }
    return [];
  }
}

module.exports = _Frontend;
