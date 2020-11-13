const util = require("util");
const _Utils = require("./lib/_utils");

/**
 * This module provides the {@link Frontend} class. This class can be
 * used to run operations on a frontend and retrieve statistics.
 *
 * @typedef {Object} Frontend
 * @property {_Frontend[]} _frontend_per_proc list of {@link _Frontend} objects
 * @property {string} _name The name of the frontend
 */
class Frontend {
  static get FRONTEND_METRICS() {
    return [
      "bin",
      "bout",
      "comp_byp",
      "comp_in",
      "comp_out",
      "comp_rsp",
      "dreq",
      "dresp",
      "ereq",
      "hrsp_1xx",
      "hrsp_2xx",
      "hrsp_3xx",
      "hrsp_4xx",
      "hrsp_5xx",
      "hrsp_other",
      "rate",
      "rate_lim",
      "rate_max",
      "req_rate",
      "req_rate_max",
      "req_tot",
      "scur",
      "slim",
      "smax",
      "stot",
    ];
  }

  /**
   * Build a user-created {@link Frontend} for a single frontend.
   *
   * @param {_Frontend[]} frontend_per_proc list of {@link _Frontend} objects.
   */
  constructor(frontend_per_proc) {
    this._frontend_per_proc = frontend_per_proc;
    this._name = this._frontend_per_proc[0].name;
  }

  /**
   * Return the unique proxy ID of the frontend.
   *
   * NOTE: Because proxy ID is the same across all processes, we return
   * the proxy ID from the 1st process.
   *
   * @returns {number}
   */
  get iid() {
    return parseInt(this._frontend_per_proc[0]._iid);
  }

  /**
   * Disable frontend.
   *
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async disable() {
    return _Utils
      .commandAcrossAllProcesses(
        this._frontend_per_proc,
        "command",
        util.format("disable frontend %s", this._name)
      )
      .then((values) => _Utils.checkCommand(values));
  }

  /**
   * Enable frontend.
   *
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async enable() {
    return _Utils
      .commandAcrossAllProcesses(
        this._frontend_per_proc,
        "command",
        util.format("enable frontend %s", this._name)
      )
      .then((values) => _Utils.checkCommand(values));
  }

  /**
   * Return the configured maximum connection allowed for frontend.
   *
   * @returns {Promise<number>}
   */
  async maxConn() {
    return this.metric("slim");
  }

  /**
   * Set maximum connection to the frontend.
   *
   * If the value ends with the '%' sign, then the new weight will be
   * relative to the initially configured weight. Absolute weights
   * are permitted between 0 and 256.
   *
   * @param {number} value max connection value.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setMaxConn(value) {
    if (typeof value !== "number") {
      throw util.format("Expected integer and got %s", typeof value);
    }
    return _Utils
      .commandAcrossAllProcesses(
        this._frontend_per_proc,
        "command",
        util.format("set maxconn frontend %s %s", this._name, value)
      )
      .then((values) => _Utils.checkCommand(values));
  }

  /**
   * Return the name of the frontend.
   *
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * Return a list of process number in which frontend is configured.
   *
   * @returns {Promise<number[]>} a list of process numbers.
   */
  async processNumber() {
    return Promise.all(
      this._frontend_per_proc.map((_frontend) => _frontend.processNumber())
    );
  }

  /**
   * Return the number of requests.
   *
   * @returns {Promise<number>}
   */
  async requests() {
    return this.metric("req_tot");
  }

  /**
   * Return the value of a metric.
   *
   * Performs a calculation on the metric across all HAProxy processes.
   * The type of calculation is either sum or avg and defined in
   * {@link _Utils.METRICS_SUM} and {@link _Utils.METRICS_AVG}.
   *
   * @param {string} name metric name to retrieve. Any of {@link FRONTEND_METRICS}
   * @returns {Promise<number>} value of the metric
   */
  async metric(name) {
    if (!Frontend.FRONTEND_METRICS.includes(name)) {
      throw util.format("%s is not valid metric", name);
    }
    return Promise.all(
      this._frontend_per_proc.map((_hap_process) => _hap_process.metric(name))
    ).then((metrics) =>
      _Utils.calculate(
        name,
        metrics.map((metric) => _Utils.converter(metric)).filter(() => true)
      )
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
      this._frontend_per_proc,
      "metric",
      "req_tot"
    );
  }

  /**
   * Disable the frontend.
   *
   * WARNING: HAProxy removes from the running configuration a frontend, so
   * further operations on the frontend will return an error.
   *
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async shutdown() {
    return _Utils
      .commandAcrossAllProcesses(
        this._frontend_per_proc,
        "command",
        util.format("shutdown frontend %s", this._name)
      )
      .then((values) => _Utils.checkCommand(values));
  }

  /**
   * Return all stats of the frontend per process.
   *
   * @returns {Promise<object[]>} A list of 2-element tuples:
   *  #. process number
   *  #. a dict with all stats
   */
  async statsPerProcess() {
    return _Utils.commandAcrossAllProcesses(this._frontend_per_proc, "stats");
  }

  /**
   * Return the status of the frontend.
   *
   * @returns {Promise<string>}
   */
  async status() {
    return _Utils
      .commandAcrossAllProcesses(this._frontend_per_proc, "metric", "status")
      .then((values) => _Utils.compareValues(values));
  }
}

module.exports = Frontend;
