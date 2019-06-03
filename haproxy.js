const fs = require("fs");
const path = require("path");
const util = require("util");
const Backend = require("./backend");
const Frontend = require("./frontend");
const Server = require("./server");
const _HAProxyProcess = require("./lib/_ha-proxy-process");
const _Utils = require("./lib/_utils");

/**
 * This module implements the main HAProxy SDK.
 *
 * @typedef {Object} HAProxy
 * @property {_HAProxyProcess[]} _hap_processes The HAProxy processes
 */
class HAProxy {
  static get BACKEND_METRICS() {
    return Backend.BACKEND_METRICS;
  }

  static get FRONTEND_METRICS() {
    return Frontend.FRONTEND_METRICS;
  }

  static get HAPROXY_METRICS() {
    return [
      "SslFrontendMaxKeyRate",
      "Hard_maxconn",
      "SessRateLimit",
      "Process_num",
      "Memmax_MB",
      "CompressBpsRateLim",
      "MaxSslConns",
      "ConnRateLimit",
      "SslRateLimit",
      "MaxConnRate",
      "CumConns",
      "SslBackendKeyRate",
      "SslCacheLookups",
      "CurrSslConns",
      "Run_queue",
      "Maxpipes",
      "Idle_pct",
      "SslFrontendKeyRate",
      "Tasks",
      "MaxZlibMemUsage",
      "SslFrontendSessionReuse_pct",
      "CurrConns",
      "SslCacheMisses",
      "SslRate",
      "CumSslConns",
      "PipesUsed",
      "Maxconn",
      "CompressBpsIn",
      "ConnRate",
      "Ulimit-n",
      "SessRate",
      "SslBackendMaxKeyRate",
      "CumReq",
      "PipesFree",
      "ZlibMemUsage",
      "Uptime_sec",
      "CompressBpsOut",
      "Maxsock",
      "MaxSslRate",
      "MaxSessRate"
    ];
  }
  static get SERVER_METRICS() {
    return Server.SERVER_METRICS;
  }

  static get SERVER_ENABLE() {
    return Server.STATE_ENABLE;
  }

  static get SERVER_DISABLE() {
    return Server.STATE_DISABLE;
  }

  static get SERVER_READY() {
    return Server.STATE_READY;
  }

  static get SERVER_DRAIN() {
    return Server.STATE_DRAIN;
  }

  static get SERVER_MAINT() {
    return Server.STATE_MAINT;
  }

  /**
   * Build a user-created {@link HAProxy} object for HAProxy.
   *
   * This is the main class to interact with HAProxy and provides methods
   * to create objects for managing frontends, backends and servers. It also
   * provides an interface to interact with HAProxy as a way to
   * retrieve settings/statistics but also change settings.
   * ACLs and MAPs are also managed by {@link HAProxy} class.
   *
   * @param {string} socket An object specifying either a directory with
   * HAProxy stats files or an absolute path to a single HAProxy stats file.
   * @param {number} [retry=2] number of times to retry to open a UNIX socket
   * connection after a failure occurred, possible values
   * - NULL => don't retry
   * - 0 => retry indefinitely
   * - 1..N => times to retry
   * @param {number} [retry_interval=2] sleep time between the retries
   * @param {number} [timeout=1] timeout for the connection
   */
  constructor(socket, retry = 2, retry_interval = 2, timeout = 1) {
    this._hap_processes = [];
    let socket_files = [];

    if (!socket) {
      throw "must specify either socket directory or path";
    }
    if (!fs.existsSync(socket)) {
      throw util.format("socket path does not exist %s", socket);
    }
    if (fs.lstatSync(socket).isDirectory()) {
      fs.readdirSync(path.join(socket, "*")).forEach(_file => {
        if (_Utils.isUnixSocket(_file) && _Utils.connectedSocket(_file)) {
          socket_files.push(_file);
        }
      });
    } else if (_Utils.isUnixSocket(socket) && _Utils.connectedSocket(socket)) {
      socket_files.push(path.normalize(socket));
    } else {
      throw "UNIX socket file was not set";
    }

    if (socket_files === undefined || socket_files.length == 0) {
      throw util.format("No valid UNIX socket file was found at %s", socket);
    }

    socket_files.forEach(so_file =>
      this._hap_processes.push(
        new _HAProxyProcess(so_file, retry, retry_interval, timeout)
      )
    );
  }

  /**
   * Add an entry into the acl.
   *
   * @param {(string|number)} acl acl id or a file.
   * @param {string} pattern entry to add.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async addAcl(acl, pattern) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "add acl %s %s",
          _Utils.isInt(acl) ? "#" + acl : acl,
          pattern
        )
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Add an entry into the map.
   *
   * @param {(string|number)} map acl id or a file.
   * @param {string} key key to add.
   * @param {string} value Value assciated to the key.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async addMap(map, key, value) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "add map %s %s %s",
          _Utils.isInt(map) ? "#" + map : map,
          key,
          value
        )
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Remove all entries from a acl.
   *
   * @param {(string|number)} acl acl id or a file.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async clearAcl(acl) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("clear acl %s", _Utils.isInt(acl) ? "#" + acl : acl)
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Remove all entries from a map.
   *
   * @param {(string|number)} map acl id or a file.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async clearMap(map) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("clear map %s", _Utils.isInt(map) ? "#" + map : map)
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Remove all entries from a stick-table.
   *
   * @param {string} table table name.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async cleaTable(table) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("clear table %s", table || "")
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Clear the max values of the statistics counters.
   *
   * When {all} is set to {true} clears all statistics counters in
   * each proxy (frontend & backend) and in each server. This has the same
   * effect as restarting.
   *
   * @param {boolean} [all=false] clear all statistics counters
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async clearCounters(all = false) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("clear counters %s", all ? "all" : "")
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Return total cumulative number of requests processed by all processes.
   *
   * This is the total number of requests that are processed by HAProxy.
   * It counts requests for frontends and backends. Don't forget that
   * a single client request passes HAProxy twice.
   *
   * @returns {Promise<number>}
   */
  async totalRequests() {
    return this.metric("CumReq");
  }

  /**
   * Return the process IDs of all HAProxy processes.
   *
   * @returns {Promise<number[]>}
   */
  async processIds() {
    return Promise.all(
      this._hap_processes.map(async _hap_process => _hap_process.metric("Pid"))
    );
  }

  /**
   * Delete all the acl entries from the acl corresponding to the key.
   *
   * @param {(string|number)} acl acl id or a file.
   * @param {string} key key to delete.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async delAcl(acl, key) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "del acl %s %s",
          _Utils.isInt(acl) ? "#" + acl : acl,
          key.startsWith("0x") ? "#" + key : key
        )
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Delete all the map entries from the map corresponding to the key.
   *
   * @param {(string|number)} map acl id or a file.
   * @param {string} key key to delete
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async delMap(map, key) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "del map %s %s",
          _Utils.isInt(map) ? "#" + map : map,
          key.startsWith("0x") ? "#" + key : key
        )
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Delete all entries from the stick-table corresponding to the key.
   *
   * @param {string} table table name
   * @param {string} key key to delete
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async delTable(table, key) {
    if (!table) {
      throw "Name must be specified";
    }
    if (!key) {
      throw "Key must be specified";
    }
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("clear table %s key %s", table, key)
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Dump last known request and response errors.
   *
   * If <iid> is specified, the limit the dump to errors concerning
   * either frontend or backend whose ID is <iid>.
   *
   * @param {string} [iid] ID of frontend or backend.
   * @returns {Promise<object[]>} A list of tuples of errors per process.
   */
  async errors(iid) {
    return _Utils.commandAcrossAllProcesses(
      this._hap_processes,
      "command",
      util.format("show errors %s", iid | ""),
      true
    );
  }

  /**
   * Build a list of {@link Frontend}s
   *
   * @param {string} [name] frontend name to look up
   * @returns {Promise<Frontend[]>} A list of {@link Frontend}s.
   */
  async frontends(name) {
    return Promise.all(
      this._hap_processes.map(_hap_process => _hap_process.frontends(name))
    )
      .then(_hap_processes_frontends => {
        let frontends_across_hap_processes = {};
        []
          .concat(
            ..._hap_processes_frontends.map(_hap_process_frontends =>
              [].concat(..._hap_process_frontends)
            )
          )
          .forEach(_frontend => {
            if (
              !frontends_across_hap_processes.hasOwnProperty(_frontend.name)
            ) {
              frontends_across_hap_processes[_frontend.name] = [];
            }
            frontends_across_hap_processes[
              _frontend.name
              ] = frontends_across_hap_processes[_frontend.name].concat(
              _frontend
            );
          });
        return frontends_across_hap_processes;
      })
      .then(frontends_across_hap_processes =>
        Object.keys(frontends_across_hap_processes).map(
          key => new Frontend(frontends_across_hap_processes[key])
        )
      );
  }

  /**
   * Build a {@link Frontend} object.
   *
   * @param {string} name frontend name to look up.
   * @returns {Promise<Frontend>} A {@link Frontend} object for the frontend.
   */
  async frontend(name) {
    if (!name) {
      throw "Name must be specified";
    }
    return this.frontends(name).then(frontends => {
      if (frontends.length == 1) {
        return frontends[0];
      } else if (frontends.length == 0) {
        throw "Could not find frontend";
      } else {
        throw "Found more than one frontend, this is a bug!";
      }
    });
  }

  /**
   * Lookup the value in the ACL.
   *
   * @param {(string|number)} acl acl id or a file.
   * @param {string} value to lookup
   * @returns {Promise<string[]>} matching patterns associated with ACL.
   */
  async getAcl(acl, key) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("get acl %s %s", _Utils.isInt(acl) ? "#" + acl : acl, key),
        true
      )
      .then(values => {
        let get_info_proc1 = values[0][1];
        if (!_Utils.checkOutput(get_info_proc1)) {
          throw util.format("value error %s", get_info_proc1);
        }
        return get_info_proc1;
      });
  }

  /**
   * Lookup the value in the map.
   *
   * @param {(string|number)} map map id or a file.
   * @param {string} value to lookup
   * @returns {Promise<string[]>} matching patterns associated with map.
   */
  async getMap(map, value) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "get map %s %s",
          _Utils.isInt(map) ? "#" + map : map,
          value
        ),
        true
      )
      .then(values => {
        let get_info_proc1 = values[0][1];
        if (!_Utils.checkOutput(get_info_proc1)) {
          throw util.format("command failed %s", get_info_proc1[0]);
        }
        return get_info_proc1;
      });
  }

  /**
   * Lookup the key in the stick-table.
   *
   * @param {string} table table name
   * @param {string} key key to lookup
   * @returns {Promise<string[]>} matching patterns associated with map.
   */
  async getTable(table, key) {
    if (!table) {
      throw "Name must be specified";
    }
    if (!key) {
      throw "Key must be specified";
    }
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("show table %s key %s", table, key),
        true
      )
      .then(values => {
        let get_info_proc1 = values[0][1];
        if (!_Utils.checkOutput(get_info_proc1)) {
          throw util.format("command failed %s", get_info_proc1[0]);
        }
        get_info_proc1.shift();
        return get_info_proc1;
      });
  }

  /**
   * Dump info about HAProxy stats on current process.
   *
   * @returns {Promise<object[]>} A list of objects for each process.
   */
  async info() {
    return Promise.all(
      this._hap_processes.map(_hap_process => _hap_process.processInfo())
    );
  }

  /**
   * Return the sum of configured maximum connections allowed for HAProxy.
   *
   * @returns {Promise<number>}
   */
  async maxConn() {
    return this.metric("Maxconn");
  }

  /**
   * Build a {@link Server} object.
   *
   * If backend specified then lookup is limited to that backend.
   *
   * NOTE: If a server is member of more than 1 backend then multiple objects for
   * the same server are returned.
   *
   * @param {string} name server name to look for.
   * @param {string} [backend] backend name to look in
   * @returns {Promise<Server[]>} A list of {@link Server}s.
   */
  async server(name, backend) {
    if (!name) {
      throw "Hostname must be specified";
    }
    return this.backends(backend)
      .then(backends => Promise.all(backends.map(backend => backend.server(name)
        .catch(() => [])))
      )
      .then(result => [].concat.apply([], result));
  }

  /**
   * Build a list of {@link Server}s
   *
   * If backend specified then lookup is limited to that backend.
   *
   * @param {string} [backend] backend name
   * @returns {Promise<Server[]>} A list of {@link Server}s.
   */
  async servers(backend) {
    return this.backends(backend)
      .then(backends => Promise.all(backends.map(backend => backend.servers())))
      .then(result => [].concat.apply([], result));
  }

  /**
   * Return the value of a metric.
   *
   * Performs a calculation on the metric across all HAProxy processes.
   * The type of calculation is either sum or avg and defined in
   * {@link _Utils.METRICS_SUM} and {@link _Utils.METRICS_AVG}.
   *
   * @param {string} name metric name to retrieve. Any of {@link HAPROXY_METRICS}
   * @returns {Promise<number>} value of the metric
   */
  async metric(name) {
    if (!HAProxy.HAPROXY_METRICS.includes(name)) {
      throw util.format("%s is not valid metric", name);
    }
    let metrics = await Promise.all(
      this._hap_processes.map(async _hap_process => _hap_process.metric(name))
    );
    return _Utils.calculate(
      name,
      metrics.map(metric => _Utils.converter(metric)).filter(() => true)
    );
  }

  /**
   * Build a list of {@link Backend}s
   *
   * @param {string} [name] backend name to look up
   * @returns {Promise<Backend[]>} A list of {@link Backend}s.
   */
  async backends(name) {
    return Promise.all(
      this._hap_processes.map(_hap_process => _hap_process.backends(name))
    )
      .then(_hap_processes_backends => {
        let backends_across_hap_processes = {};
        []
          .concat(
            ..._hap_processes_backends.map(_hap_process_backends =>
              [].concat(..._hap_process_backends)
            )
          )
          .forEach(_backend => {
            if (!backends_across_hap_processes.hasOwnProperty(_backend.name)) {
              backends_across_hap_processes[_backend.name] = [];
            }
            backends_across_hap_processes[
              _backend.name
              ] = backends_across_hap_processes[_backend.name].concat(_backend);
          });
        return backends_across_hap_processes;
      })
      .then(backends_across_hap_processes =>
        Object.keys(backends_across_hap_processes).map(
          key => new Backend(backends_across_hap_processes[key])
        )
      );
  }

  /**
   * Build a {@link Backend} object.
   *
   * @param {string} name backend name to look up.
   * @returns {Promise<Backend>} A {@link Backend} object for the backend.
   */
  async backend(name) {
    if (!name) {
      throw "Name must be specified";
    }
    return this.backends(name).then(backends => {
      if (backends.length == 1) {
        return backends[0];
      } else if (backends.length == 0) {
        throw "Could not find backend";
      } else {
        throw "Found more than one backend, this is a bug!";
      }
    });
  }

  /**
   * Return the process-wide connection rate limit.
   *
   * @returns {Promise<number>}
   */
  async rateLimitConn() {
    return this.metric("ConnRateLimit");
  }

  /**
   * Return the process-wide session rate limit.
   *
   * @returns {Promise<number>}
   */
  async rateLimitSess() {
    return this.metric("SessRateLimit");
  }

  /**
   * Return the process-wide ssl session rate limit.
   *
   * @returns {Promise<number>}
   */
  async rateLimitSSLSess() {
    return this.metric("SslRateLimit");
  }

  /**
   * Return total requests processed by all frontends.
   *
   * @returns {Promise<number>}
   */
  async requests() {
    return this.frontends()
      .then(frontends =>
        Promise.all(frontends.map(frontend => frontend.requests()))
      )
      .then(requests => requests.reduce((a, b) => a + b, 0));
  }

  /**
   * Modify the value corresponding to each key in a map.
   *
   * @param {(string|number)} map map id or a file.
   * @param {string} key id
   * @param {string} value to set for the key.
   * @returns {Promise<string>} matching patterns associated with map.
   */
  async setMap(map, key, value) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "set map %s %s %s",
          _Utils.isInt(map) ? "#" + map : map,
          key.startsWith("0x") ? "#" + key : key,
          value
        )
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Modify the value corresponding to each key in a stick-table.
   *
   * @param {string} table table name
   * @param {string} key key
   * @param {string} value to set for the key.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setTable(table, key, value) {
    if (!table) {
      throw "Name must be specified";
    }
    if (!key) {
      throw "Key must be specified";
    }
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("set table %s key %s %s", table, key, value || "")
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Send a command to HAProxy process.
   *
   * This allows a user to send any kind of command to HAProxy.
   * We **do not* perform any sanitization on input and on output.
   *
   * @param {string} cmd a command to send to haproxy process.
   * @returns {Promise<object[]>} list of 2-item tuple
   *  #. HAProxy process number
   *  #. what the method returned
   */
  async command(cmd) {
    return _Utils.commandAcrossAllProcesses(
      this._hap_processes,
      "command",
      cmd,
      true
    );
  }

  /**
   * Set maximum connection to the frontend.
   *
   * @param {number} value value to set.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setMaxConn(value) {
    if (!_Utils.isInt(value))
      throw util.format("Expected integer and got %s", typeof value);
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("set maxconn global %s", value)
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Set process-wide connection rate limit.
   *
   * @param {number} value rate connection limit.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setRateLimitConn(value) {
    if (!_Utils.isInt(value))
      throw util.format("Expected integer and got %s", typeof value);
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("set rate-limit connections global %s", value)
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Set process-wide session rate limit.
   *
   * @param {number} value rate session limit.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setRateLimitSession(value) {
    if (!_Utils.isInt(value))
      throw util.format("Expected integer and got %s", typeof value);
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("set rate-limit sessions global %s", value)
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Set process-wide ssl session rate limit.
   *
   * @param {number} value rate ssl session limit.
   * @returns {Promise<boolean>} {true} if command succeeds otherwise {false}
   */
  async setRateLimitSSLSession(value) {
    if (!_Utils.isInt(value))
      throw util.format("Expected integer and got %s", typeof value);
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("set rate-limit ssl-sessions global %s", value)
      )
      .then(values => _Utils.checkCommand(values));
  }

  /**
   * Dump info about acls.
   *
   * Without argument, the list of all available acls is returned.
   * If an acl id is specified, its contents are dumped.
   *
   * @param {(string|number)} [acl=NULL] acl id or a file.
   * @returns {Promise<string[]>} a list with the acls
   */
  async showAcl(acl) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "show acl %s",
          acl ? (_Utils.isInt(acl) ? "#" + acl : acl) : ""
        ),
        true
      )
      .then(values => {
        // ACL can't be different per process thus we only return the acl
        // content found in 1st process.
        let acl_info_proc1 = values[0][1];

        if (!_Utils.checkOutput(acl_info_proc1)) {
          throw util.format("command failed %s", acl_info_proc1[0]);
        }
        if (acl_info_proc1.length == 1 && !acl_info_proc1[0]) return [];

        if (!acl) acl_info_proc1.shift();
        return acl_info_proc1;
      });
  }

  /**
   * Dump info about maps.
   *
   * Without argument, the list of all available maps is returned.
   * If a map id is specified, its contents are dumped.
   *
   * @param {(string|number)} [map=NULL] map id or a file.
   * @returns {Promise<string[]>} a list with the maps
   */
  async showMap(map) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format(
          "show map %s",
          map ? (_Utils.isInt(map) ? "#" + map : map) : " "
        ),
        true
      )
      .then(values => {
        // map can't be different per process thus we only return the map
        // content found in 1st process.
        let map_info_proc1 = values[0][1];

        if (!_Utils.checkOutput(map_info_proc1)) {
          throw util.format("command failed %s", map_info_proc1[0]);
        }
        if (map_info_proc1.length == 1 && !map_info_proc1[0]) return [];

        if (!map) map_info_proc1.shift();
        return map_info_proc1;
      });
  }

  /**
   * Dump info about stick-tables.
   *
   * Without argument, the list of all available tables is returned.
   * If a table name is specified, its contents are dumped.
   *
   * @param {string} [name=NULL] table name.
   * @returns {Promise<string[]>} a list with the tables
   */
  async showTable(table) {
    return _Utils
      .commandAcrossAllProcesses(
        this._hap_processes,
        "command",
        util.format("show table %s", table || ""),
        true
      )
      .then(values => {
        // tables can't be different per process thus we only return the table
        // content found in 1st process.
        let table_info_proc1 = values[0][1];

        if (!_Utils.checkOutput(table_info_proc1)) {
          throw util.format("command failed %s", table_info_proc1[0]);
        }
        return table_info_proc1.length == 1 && !table_info_proc1[0]
          ? []
          : table_info_proc1;
      });
  }

  /**
   * Return uptime of HAProxy process.
   *
   * @returns {Promise<string>}
   */
  async uptime() {
    return _Utils
      .commandAcrossAllProcesses(this._hap_processes, "metric", "Uptime")
      .then(values => values[0][1]);
  }

  /**
   * Return description of HAProxy.
   *
   * @returns {Promise<string>}
   */
  async description() {
    return _Utils
      .commandAcrossAllProcesses(this._hap_processes, "metric", "description")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return nodename of HAProxy.
   *
   * @returns {Promise<string>}
   */
  async nodeName() {
    return _Utils
      .commandAcrossAllProcesses(this._hap_processes, "metric", "node")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return uptime of HAProxy process in seconds.
   *
   * @returns {Promise<number>}
   */
  async uptimeSec() {
    return _Utils
      .commandAcrossAllProcesses(this._hap_processes, "metric", "Uptime_sec")
      .then(values => values[0][1]);
  }

  /**
   * Return release date of HAProxy.
   *
   * @returns {Promise<string>}
   */
  async releaseDate() {
    return _Utils
      .commandAcrossAllProcesses(this._hap_processes, "metric", "Release_date")
      .then(values => _Utils.compareValues(values));
  }

  /**
   * Return version of HAProxy.
   *
   * @returns {Promise<string>}
   */
  async version() {
    return _Utils
      .commandAcrossAllProcesses(this._hap_processes, "metric", "Version")
      .then(values => _Utils.compareValues(values));
  }
}

module.exports = HAProxy;
