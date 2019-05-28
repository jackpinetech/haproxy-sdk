const Server = require("./server");
const _Utils = require("./lib/_utils");

/**
 * This module provides the {@link Backend} class which allows to run operation for a backend.
 *
 * @typedef {Object} Backend
 * @property {_Backend[]} _backend_per_proc list of {@link _Backend} objects
 * @property {string} _name The name of the backend
 */
class Backend {
  static get BACKEND_METRICS() {
    return [
      "act",
      "bck",
      "bin",
      "bout",
      "chkdown",
      "cli_abrt",
      "comp_byp",
      "comp_in",
      "comp_out",
      "comp_rsp",
      "ctime",
      "downtime",
      "dreq",
      "dresp",
      "econ",
      "eresp",
      "hrsp_1xx",
      "hrsp_2xx",
      "hrsp_3xx",
      "hrsp_4xx",
      "hrsp_5xx",
      "hrsp_other",
      "lastchg",
      "lastsess",
      "lbtot",
      "qcur",
      "qmax",
      "qtime",
      "rate",
      "rate_max",
      "rtime",
      "scur",
      "slim",
      "smax",
      "srv_abrt",
      "stot",
      "ttime",
      "weight",
      "wredis",
      "wretr"
    ];
  }

  /**
   * Build a user-created {@link Backend} for a single backend.
   *
   * @param {_Backend[]} backend_per_proc list of {@link _Backend} objects.
   */
  constructor(backend_per_proc) {
    this._backend_per_proc = backend_per_proc;
    this._name = this._backend_per_proc[0].name;
  }

  /**
   * Return the unique proxy ID of the backend.
   *
   * NOTE: Because proxy ID is the same across all processes, we return
   * the proxy ID from the 1st process.
   *
   * @returns {number}
   */
  get iid() {
    return parseInt(this._backend_per_proc[0]._iid);
  }

  /**
   * Return the name of the backend.
   *
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * Return a list of process number in which backend is configured.
   *
   * @returns {Promise<number[]>} a list of process numbers.
   */
  async processNumber() {
    return Promise.all(
      this._backend_per_proc.map(_backend => _backend.processNumber())
    );
  }

  /**
   * Return the number of requests.
   *
   * @returns {Promise<number>}
   */
  async requests() {
    return this.metric("stot");
  }

  /**
   * Return the status of the backend.
   *
   * @returns {Promise<string>}
   */
  async status() {
    return _Utils
      .commandAcrossAllProcesses(this._backend_per_proc, "metric", "status")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return the value of a metric.
   *
   * Performs a calculation on the metric across all HAProxy processes.
   * The type of calculation is either sum or avg and defined in
   * {@link _Utils.METRICS_SUM} and {@link _Utils.METRICS_AVG}.
   *
   * @param {string} name metric name to retrieve. Any of {@link BACKEND_METRICS}
   * @returns {Promise<number>} value of the metric
   */
  async metric(name) {
    if (!Backend.BACKEND_METRICS.includes(name)) {
      throw util.format("%s is not valid metric", name);
    }
    let metrics = await Promise.all(
      this._backend_per_proc.map(async _hap_process =>
        _hap_process.metric(name)
      )
    );
    return _Utils.calculate(
      name,
      metrics.map(metric => _Utils.converter(metric)).filter(() => true)
    );
  }

  /**
   * Return the number of requests for the backend per process.
   *
   * @returns {Promise<object[]>} A list of 2-element tuples:
   *  #. process number
   *  #. requests
   */
  async requestsPerProcess() {
    return _Utils.commandAcrossAllProcesses(
      this._backend_per_proc,
      "metric",
      "stot"
    );
  }

  /**
   * Return all stats of the backend per process.
   *
   * @returns {Promise<object[]>} A list of 2-element tuples:
   *  #. process number
   *  #. a dict with all stats
   */
  async statsPerProcess() {
    return _Utils.commandAcrossAllProcesses(this._backend_per_proc, "stats");
  }

  /**
   * Return a {@link Server} object.
   *
   * @param {string} name Name of the server.
   * @returns {Promise<Server>} {@link Server} object
   */
  async server(name) {
    if (!name) {
      throw "Name must be specified";
    }
    return this.servers(name).then(servers => {
      if (servers.length == 1) {
        return servers[0];
      } else if (servers.length == 0) {
        throw "Could not find server";
      } else {
        throw "Found more than one server, this is a bug!";
      }
    });
  }

  /**
   * Return {@link Server} object for each server.
   *
   * @param {string} [name] Servername to look for.
   * @returns {Promise<Server[]>} A list of {@link Server} objects
   */
  async servers(name) {
    let servers_across_hap_processes = {};

    let _servers = await Promise.all(
      this._backend_per_proc.map(async _backend => {
        let _servers = await _backend.servers(name);
        _servers.forEach(_server => {
          if (!servers_across_hap_processes.hasOwnProperty(_server.name)) {
            servers_across_hap_processes[_server.name] = [];
          }
          servers_across_hap_processes[_server.name].push(_server);
        });
      })
    );

    return Object.values(servers_across_hap_processes).map(
      _server => new Server(_server, this.name)
    );
  }
}

module.exports = Backend;
