const _Server = require("./_server");
const _Utils = require("./_utils");

/**
 * This module provides a class, which is used within haproxy-sdk for creating a
 * object to work with a backend. This object is associated only with a single
 * HAProxy process.
 *
 * @typedef {Object} _Backend
 * @type {_HAProxyProcess} hap_process The HAProxy process
 * @type {string} _name The name of the backend
 * @type {number} hap_process_nb The process number of the HAProxy process
 * @type {string} _iid The unique proxy id of the backend
 */
class _Backend {
  /**
   * Class for interacting with a backend in one HAProxy process.
   *
   * @param {_HAProxyProcess} hap_process a {@link _HAProxyProcess} object.
   * @param {string} name backend name
   * @param {string} iid unique proxy id of the backend
   */
  constructor(hap_process, name, iid) {
    this._hap_process = hap_process;
    this._name = name;
    this.hap_process_nb = this._hap_process.process_nb;
    this._iid = iid;
  }

  /**
   * Return a string which is the name of the backend.
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
    return this.statsData().then((value) => {
      this._iid = value.get("iid");
      return this._iid;
    });
  }

  /**
   * Return the process number of the HAProxy process.
   *
   * @returns {Promise<number>}
   */
  async processNumber() {
    return this.hap_process_nb.then((hap_process_nb) =>
      parseInt(hap_process_nb, 10)
    );
  }

  /**
   * Send command to HAProxy.
   *
   * @param {string} cmd command to send
   * @returns {Promise<string>} the output of the command
   */
  async command(cmd) {
    return this._hap_process.command(cmd);
  }

  /**
   * Return a backend metric.
   *
   * @param {string} name
   * @returns {Promise<string>}
   */
  async metric(name) {
    return this.statsData().then((value) => value.get(name));
  }

  /**
   * Return a list of {@link _Server} objects for each server of the backend.
   *
   * @param {string} [name] server name to lookup
   * @returns {Promise<_Server[]>}
   */
  async servers(name) {
    return this._hap_process
      .serversStats(this.name, this._iid)
      .then((_csvLines) => {
        let return_list = [];
        if (name) {
          if (Object.prototype.hasOwnProperty.call(_csvLines, name)) {
            return_list.push(
              new _Server(this, name, _csvLines[name].get("sid"))
            );
          } else {
            return [];
          }
        } else {
          for (let _name in _csvLines) {
            return_list.push(
              new _Server(this, _name, _csvLines[_name].get("sid"))
            );
          }
        }
        return return_list;
      });
  }

  /**
   * Build dictionary for all statistics reported by HAProxy.
   *
   * @returns {Promise<object>} a dictionary with statistics
   */
  async stats() {
    return this.statsData().then((value) =>
      _Utils.dict(_Utils.zip(value._heads, value._parts))
    );
  }

  /**
   * Return stats data.
   *
   * Check documentation of {@link _Frontend.statsData()}.
   *
   * @returns {Promise<_CSVLine>}
   */
  async statsData() {
    try {
      return this._hap_process
        .backendsStats(this._iid)
        .then((stats) => stats[this.name]["stats"]);
    } catch (e) {
      try {
        return this._hap_process
          .backendsStats()
          .then((stats) => stats[this.name]["stats"]);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  }
}

module.exports = _Backend;
