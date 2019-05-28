const util = require("util");
const _Utils = require("./lib/_utils");

/**
 * This module provides the {@link Server} class which allows to run operation for a server.
 *
 * @typedef {Object} Server
 * @property {_Server[]} _server_per_proc list of {@link _Server} objects
 * @property {string} _backendname backend name
 * @property {string} name_ The name of the server
 */
class Server {
  static get STATE_ENABLE() {
    return "enable";
  }

  static get STATE_DISABLE() {
    return "disable";
  }

  static get STATE_READY() {
    return "ready";
  }

  static get STATE_DRAIN() {
    return "drain";
  }

  static get STATE_MAINT() {
    return "maint";
  }

  static get VALID_STATES() {
    return [
      Server.STATE_ENABLE,
      Server.STATE_DISABLE,
      Server.STATE_MAINT,
      Server.STATE_DRAIN,
      Server.STATE_READY
    ];
  }

  static get SERVER_METRICS() {
    return [
      "act",
      "bck",
      "bin",
      "bout",
      "check_duration",
      "chkdown",
      "chkfail",
      "cli_abrt",
      "ctime",
      "downtime",
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
      "qlimit",
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
      "throttle",
      "ttime",
      "weight",
      "wredis",
      "wretr"
    ];
  }

  /**
   * Build a user-created {@link Server} for a single server.
   *
   * @param {_Server[]} server_per_proc list of {@link _Server} objects.
   * @param {string} backendname backend name
   */
  constructor(server_per_proc, backendname) {
    this._server_per_proc = server_per_proc;
    this._backendname = backendname;
    this._name = this._server_per_proc[0].name;
  }

  /**
   * Return the backend name of the server.
   *
   * @returns {string}
   */
  get backendName() {
    return this._backendname;
  }

  /**
   * Return the unique proxy server ID of the server.
   *
   * NOTE: Because server ID is the same across all processes, we return
   * the proxy ID from the 1st process.
   *
   * @returns {number}
   */
  get sid() {
    return this._server_per_proc[0]._sid;
  }

  /**
   * Return the check code.
   *
   * @returns {Promise<string>}
   */
  async checkCode() {
    return _Utils
      .commandAcrossAllProcesses(this._server_per_proc, "metric", "check_code")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return the check status.
   *
   * @returns {Promise<string>}
   */
  async checkStatus() {
    return _Utils
      .commandAcrossAllProcesses(
        this._server_per_proc,
        "metric",
        "check_status"
      )
      .then(values => _Utils.compareValues(values));
  }

  /**
   * The assigned port of server.
   *
   * @returns {Promise<string>}
   */
  async port() {
    let values = await _Utils.commandAcrossAllProcesses(
      this._server_per_proc,
      "metric",
      "addr"
    );
    try {
      let value = _Utils.compareValues(values);
      return value.split(":")[1];
    } catch (e) {
      // haproxy returns address:port and compareValues() may raise
      // IncosistentData exception because assigned address is different
      // per process and not the assigned port.
      // Since we want to report the port, we simply catch that case and
      // report the assigned port.
      let portsAcrossProc = values.map(value => value.split(":")[1]);
      if (_Utils.elementsOfListSame(portsAcrossProc)) {
        return portsAcrossProc[0];
      } else {
        throw "Inconsistent data";
      }
    }
  }

  /**
   * Set server's port.
   *
   * @param {number} port
   * @returns {Promise<boolean>}
   */
  async setPort(port) {
    return this.address()
      .then(address =>
        _Utils.commandAcrossAllProcesses(
          this._server_per_proc,
          "command",
          util.format(
            "set server %s/%s addr %s port %s",
            this._backendname,
            this._name,
            address,
            port
          )
        )
      )
      .then(values => _Utils.checkCommandAddressPort("addr", values));
  }

  /**
   * The assigned address of server.
   *
   * @returns {Promise<string>}
   */
  async address() {
    let values = await _Utils.commandAcrossAllProcesses(
      this._server_per_proc,
      "metric",
      "addr"
    );
    try {
      let value = _Utils.compareValues(values);
      return value.split(":")[0];
    } catch (e) {
      // haproxy returns address:port and compareValues() may raise
      // IncosistentData exception because assigned address is different
      // per process and not the assigned port.
      // Since we want to report the port, we simply catch that case and
      // report the assigned port.
      let addressesAcrossProc = values.map(value => value.split(":")[0]);
      if (_Utils.elementsOfListSame(addressesAcrossProc)) {
        return addressesAcrossProc[0];
      } else {
        throw "Inconsistent data";
      }
    }
  }

  /**
   * Set server's address.
   *
   * @param {string} address
   * @returns {Promise<boolean>}
   */
  async setAddress(address) {
    return this.port()
      .then(port =>
        _Utils.commandAcrossAllProcesses(
          this._server_per_proc,
          "command",
          util.format(
            "set server %s/%s addr %s port %s",
            this._backendname,
            this._name,
            address,
            port
          )
        )
      )
      .then(values => _Utils.checkCommandAddressPort("addr", values));
  }

  /**
   * Return the last health check contents or textual error.
   *
   * @returns {Promise<string>}
   */
  async lastStatus() {
    return _Utils
      .commandAcrossAllProcesses(this._server_per_proc, "metric", "last_chk")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return the last agent check contents or textual error.
   *
   * @returns {Promise<string>}
   */
  async lastAgentCheck() {
    return _Utils
      .commandAcrossAllProcesses(this._server_per_proc, "metric", "last_agt")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return the name of the server.
   *
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * Return a list of process number in which backend server is configured.
   *
   * @returns {Promise<number[]>} a list of process numbers.
   */
  async processNumber() {
    return Promise.all(
      this._server_per_proc.map(_server => _server.processNumber())
    );
  }

  /**
   * Set the state of a server in the backend.
   *
   * State can be any of the following:
   *  *. {@link Server.STATE_ENABLE}: Mark the server UP and checks are re-enabled
   *  *. {@link Server.STATE_DISABLE}: Mark the server DOWN for maintenance and checks disabled.
   *  *. {@link Server.STATE_READY}: Put server in normal mode.
   *  *. {@link Server.STATE_DRAIN}: Remove the server from load balancing.
   *  *. {@link Server.STATE_MAINT}: Remove the server from load balancing and health checks are disabled.
   *
   * @param {string} state state to set.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setState(state) {
    if (!Server.VALID_STATES.includes(state)) {
      throw util.format(
        "Wrong state, allowed states %s",
        Server.VALID_STATES.join(", ")
      );
    }
    return _Utils
      .commandAcrossAllProcesses(
        this._server_per_proc,
        "command",
        ["enable", "disable"].includes(state)
          ? util.format("%s server %s/%s", state, this._backendname, this._name)
          : util.format(
              "set server %s/%s state %s",
              state,
              this._backendname,
              this._name
            )
      )
      .then(values => _Utils.checkCommand(values));
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
   * Return the status of the server.
   *
   * @returns {Promise<string>}
   */
  async status() {
    return _Utils
      .commandAcrossAllProcesses(this._server_per_proc, "metric", "status")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return the weight of the server.
   *
   * @returns {Promise<string>}
   */
  async weight() {
    return _Utils
      .commandAcrossAllProcesses(this._server_per_proc, "metric", "weight")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Set a weight.
   *
   * If the value ends with the '%' sign, then the new weight will be
   * relative to the initially configured weight. Absolute weights
   * are permitted between 0 and 256.
   *
   * @param {(number|string)} weight Weight to set
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setWeight(weight) {
    let msg =
      "Invalid weight, absolute weights are permitted between 0 and" +
      " 256 and need to be passed as integers or relative weights" +
      " are allowed when the value ends with the '%' sign pass as string";

    if (
      (_Utils.isInt(weight) && 0 <= weight < 256) ||
      (typeof weight === "string" && weight.endsWith("%"))
    ) {
      return _Utils
        .commandAcrossAllProcesses(
          this._server_per_proc,
          "command",
          util.format(
            "set weight %s/%s %s",
            this._backendname,
            this._name,
            weight
          )
        )
        .then(values => _Utils.checkCommand(values));
    }
    throw msg;
  }

  /**
   * Terminate all the sessions attached to the specified server.
   *
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async shutdown() {
    return _Utils
      .commandAcrossAllProcesses(
        this._server_per_proc,
        "command",
        util.format(
          "shutdown sessions server %s/%s",
          this._backendname,
          this._name
        )
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Return the value of a metric.
   *
   * Performs a calculation on the metric across all HAProxy processes.
   * The type of calculation is either sum or avg and defined in
   * {@link _Utils.METRICS_SUM} and {@link _Utils.METRICS_AVG}.
   *
   * @param {string} name metric name to retrieve. Any of {@link SERVER_METRICS}
   * @returns {Promise<number>} value of the metric
   */
  async metric(name) {
    if (!Server.SERVER_METRICS.includes(name)) {
      throw Error(util.format("%s is not valid metric", name));
    }
    let metrics = await Promise.all(
      this._server_per_proc.map(async _server => _server.metric(name))
    );
    return _Utils.calculate(
      name,
      metrics.map(metric => _Utils.converter(metric)).filter(() => true)
    );
  }

  /**
   * Return the number of requests for the server per process.
   *
   * @returns {Promise<object[]>} A list of 2-element tuples:
   *  #. process number
   *  #. requests
   */
  async requestsPerProcess() {
    return _Utils.commandAcrossAllProcesses(
      this._server_per_proc,
      "metric",
      "stot"
    );
  }

  /**
   * Return all stats of the server per process.
   *
   * @returns {Promise<object[]>} A list of 2-element tuples:
   *  #. process number
   *  #. a dict with all stats
   */
  async statsPerProcess() {
    return _Utils.commandAcrossAllProcesses(this._server_per_proc, "stats");
  }
}

module.exports = Server;
