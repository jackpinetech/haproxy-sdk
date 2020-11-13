const _Utils = require("./_utils");

/**
 * This module provides a class, which is used within haproxy-sdk for creating a
 * object to work with a server. This object is associated only with a single
 * HAProxy process.
 *
 * @typedef {Object} _Server
 * @type {_Backend} backend The backend that server is part of
 * @type {string} _name The name of the server
 * @type {string} _sid The unique server id
 */
class _Server {
  /**
   * Class for interacting with a server of a backend in one HAProxy.
   *
   * @param {_Backend} backend a {@link _Backend} object that server is part of.
   * @param {string} name server name
   * @param {string} sid server id (unique inside a proxy)
   */
  constructor(backend, name, sid) {
    this._backend = backend;
    this._name = name;
    this._sid = sid;
  }

  /**
   * Return the name of the backend server.
   *
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * Return server id.
   *
   * @returns {Promise<string>}
   */
  async sid() {
    return this.statsData().then((value) => {
      this._sid = value.get("sid");
      return this._sid;
    });
  }

  /**
   * Return the process number of the HAProxy process.
   *
   * @returns {Promise<number>}
   */
  async processNumber() {
    return this._backend.processNumber();
  }

  /**
   * Send command to HAProxy.
   *
   * @param {string} cmd command to send
   * @returns {Promise<string>} the output of the command
   */
  async command(cmd) {
    return this._backend._hap_process.command(cmd);
  }

  /**
   * Return a server metric.
   *
   * @param {string} name
   * @returns {Promise<string>}
   */
  async metric(name) {
    return this.statsData().then((value) => value.get(name));
  }

  /**
   * Build dictionary for all statistics reported by HAProxy.
   *
   * @returns {Promise<object>} A dictionary with statistics
   */
  async stats() {
    let data = await this.statsData();

    return _Utils.dict(_Utils.zip(data._heads, data._parts));
  }

  /**
   * Return stats data.
   *
   * Check documentation of {@link _Frontend.statsData()}.
   *
   * @returns {Promise<_CSVLine>}
   */
  async statsData() {
    // Fetch data using the last known sid
    try {
      return this._backend._hap_process
        .serversStats(this._backend.name, this._backend._iid, this._sid)
        .then((stats) => stats[this.name]);
    } catch (e) {
      try {
        return this._backend._hap_process
          .serversStats(this._backend.name)
          .then((stats) => stats[this.name]);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  }
}

module.exports = _Server;
