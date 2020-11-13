const net = require("net");
const util = require("util");
const _Backend = require("./_backend");
const _Frontend = require("./_frontend");
const _Utils = require("./_utils");

/**
 * This module provides the main class that is used within haproxy-sdk for creating
 * objects to work with a single HAProxy process. All other internal classes use
 * this class to send commands to HAProxy process.
 *
 * @typedef {Object} _HAProxyProcess
 * @property {string} socket_file The HAProxy socket file
 * @property {object} hap_stats The current HAProxy stats object
 * @property {object} hap_info The current HAProxy info object
 * @property {number} retry The number of socket connection retries
 * @property {number} retry_interval The delay between socket connection retries
 * @property {number} timeout The timeout for socket connection attempts
 * @property {Promise<string>} process_nb The process number associated with this object
 */
class _HAProxyProcess {
  /**
   * An object to a single HAProxy process.
   *
   * It acts as a communication pipe between the caller and individual
   * HAProxy process using UNIX stats socket.
   *
   * @param {string} socket_file Full path of socket file.
   * @param {number} [retry=3] Number of connect retries
   * @param {number} [retry_interval=2] Interval time in seconds between retries
   * @param {number} [timeout=1] Timeout in seconds for the connection
   */
  constructor(socket_file, retry = 3, retry_interval = 2, timeout = 1) {
    this.socket_file = socket_file;
    this.hap_stats = {};
    this.hap_info = {};
    this.retry = retry;
    this.retry_interval = retry_interval;
    this.timeout = timeout;
    this.process_nb = this.metric("Process_num");
  }

  /**
   * Return the process number of the HAProxy process.
   *
   * @returns {number}
   */
  async processNumber() {
    return this.process_nb.then((process_nb) => parseInt(process_nb, 10));
  }

  /**
   * Return a nested dictionary containing backend information.
   *
   * @param {string} [iid='-1'] Unique proxy id, applicable for frontends and backends.
   * @param {number} [obj_type=1] selects the type of dumpable objects
   * - 1 for frontends
   * - 2 for backends
   * - 4 for servers
   * - -1 for everything.
   * These values can be ORed, for example:
   * 1 + 2     = 3   -> frontend + backend.
   * 1 + 2 + 4 = 7   -> frontend + backend + server.
   * @param {number} [sid=-1] a server ID, -1 to dump everything.
   * @returns {Promise<object>} see {@link _Utils.info2dict()} for details on the structure
   */
  async stats(iid = "-1", obj_type = -1, sid = -1) {
    return this.command(
      util.format("show stat %s %s %s", iid, obj_type, sid),
      true
    ).then((csv_data) => {
      this.hap_stats = _Utils.stat2dict(csv_data);
      return this.hap_stats;
    });
  }

  /**
   * Return a metric.
   *
   * @param {string} name
   * @returns {Promise<string>}
   */
  async metric(name) {
    return this.processInfo().then((proc_info) => proc_info[name]);
  }

  /**
   * Build the data structure for backends.
   *
   * If iid is set then builds a structure only for the particular backend.
   *
   * @param {string} [n='-1'] iid unique proxy id of a backend.
   * @returns {Promise<object>} a dictionary with backend information.
   */
  async backendsStats(iid = "-1") {
    return this.stats(iid, 2).then((stats) => stats["backends"]);
  }

  /**
   * Build the data structure for frontends.
   *
   * If iid is set then builds a structure only for the particular frontend.
   *
   * @param {string} [n='-1'] iid unique proxy id of a frontend.
   * @returns {Promise<object>} a dictionary with frontend information.
   */
  async frontendsStats(iid = "-1") {
    return this.stats(iid, 1).then((stats) => stats["frontends"]);
  }

  /**
   * Build {@link _Frontend} objects for each frontend.
   *
   * @param {string} [name] frontend name
   * @returns {Promise<_Frontend[]>} a list of {@link _Frontend} objects for each frontend
   */
  async frontends(name) {
    let frontends = await this.frontendsStats(),
      return_list = [];

    if (name) {
      if (Object.prototype.hasOwnProperty.call(frontends, name)) {
        return_list.push(new _Frontend(this, name, frontends[name].get("iid")));
      } else {
        return return_list;
      }
    } else {
      for (let name in frontends) {
        return_list.push(new _Frontend(this, name, frontends[name].get("iid")));
      }
    }
    return return_list;
  }

  /**
   * Build {@link _Backend} objects for each backend.
   *
   * @param {string} [name] backend name
   * @returns {Promise<_Backend[]>} a list of {@link _Backend} objects for each backend
   */
  async backends(name) {
    let _backends = await this.backendsStats(),
      return_list = [];

    if (name) {
      if (Object.prototype.hasOwnProperty.call(_backends, name)) {
        return_list.push(
          new _Backend(this, name, _backends[name]["stats"].get("iid"))
        );
      } else {
        return return_list;
      }
    } else {
      for (let _backend in _backends) {
        return_list.push(
          new _Backend(this, _backend, _backends[_backend]["stats"].get("iid"))
        );
      }
    }

    return return_list;
  }

  /**
   * Return a list of stats objects for all servers in a backend.
   *
   * @param {string} name backend name
   * @param {string} [iid='-1'] proxy id
   * @param {number} [sid='-1'] server id
   * @returns {Promise<_Utils.CSVLine[]>}
   */
  async serversStats(name, iid = "-1", sid = -1) {
    return this.stats(iid, 6, sid).then(
      (stats) => stats["backends"][name]["servers"]
    );
  }

  /**
   * Return a dictionary containing information about HAProxy daemon.
   *
   * @returns {Promise<object>} see {@link _Utils.info2dict()} for details
   */
  async processInfo() {
    return this.command("show info", true).then((raw_info) => {
      this.hap_info = _Utils.info2dict(raw_info);
      return this.hap_info;
    });
  }

  /**
   * Send a command to HAProxy over UNIX stats socket.
   *
   * Newline character returned from HAProxy is stripped off.
   *
   * @param {string} cmd A valid command to execute
   * @param {boolean} [full_output=false] full_output Return all output
   * @returns {(Promise<string>\|Promise<string[]>)} first line of the output
   * or the whole output as a list
   */
  async command(command, full_output = false) {
    let attempt = 0; // times to attempt to connect after a connection failure

    if (this.retry == 0) {
      //# 0 means retry indefinitely
      attempt = -1;
    } else if (!this.retry) {
      //# None means don't retry
      attempt = 1;
    } else {
      //# any other value means retry N times
      attempt = this.retry + 1;
    }

    let raised = null;

    for (let i = attempt; i != 0; i--) {
      try {
        return await this._command(command, full_output);
      } catch (e) {
        raised = e;
        await new Promise((res) => setTimeout(res, this.retry_interval * 1000));
      }
    }

    throw raised;
  }

  _command(command, full_output) {
    return new Promise((resolve, reject) => {
      let socket = net.connect(this.socket_file),
        data = null,
        buffer = "";

      socket.setTimeout(this.timeout * 1000);

      socket
        .once("connect", () => socket.end(command + "\n"))
        .on("data", (chunk) => {
          buffer += chunk;
        })
        .once("error", (err) => {
          //
          // We've received an error on the socket
          //
          buffer = ""; // Kill the buffer, saves memory.

          //
          // If it has failed to connect we want to emit that the proxy as we assume
          // that the proxy should always be alive and kicking with a socket...or you
          // wouldn't be using the module. We need to check for the error code because
          // that impacts if we should retry
          //
          reject(err);
        })
        .once("end", () => {
          data = buffer.trim().split("\n");
          // HAProxy always send an empty string at the end
          // we remove it as it adds noise for things like ACL/MAP and etc
          // We only do that when we get more than 1 line, which only
          // happens when we ask for ACL/MAP/etc and not for giving cmds
          // such as disable/enable server
          if (data.length > 1 && data[data.length - 1] === "") data.pop();

          buffer = "";

          resolve(full_output ? data : data[0]);
        })
        .once("close", async (hadError) => {
          if (hadError) return;

          if (data.length == 0) reject(Error("No data received"));
        });
    });
  }
}

module.exports = _HAProxyProcess;
