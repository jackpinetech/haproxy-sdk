const fs = require('fs');
const net = require('net');
const util = require('util');
const CommandStatus = require('../command-status');

/**
 * @typedef {Object} _Utils
 *
 * This module provides utility functions and classes that are used within haproxyadmin.
 */
class _Utils {
  static get METRICS_SUM() {
    return [
      'CompressBpsIn',
      'CompressBpsOut',
      'CompressBpsRateLim',
      'ConnRate',
      'ConnRateLimit',
      'CumConns',
      'CumReq',
      'CumSslConns',
      'CurrConns',
      'CurrSslConns',
      'Hard_maxconn',
      'Idle_pct',
      'MaxConnRate',
      'MaxSessRate',
      'MaxSslConns',
      'MaxSslRate',
      'MaxZlibMemUsage',
      'Maxconn',
      'Maxpipes',
      'Maxsock',
      'Memmax_MB',
      'PipesFree',
      'PipesUsed',
      'Process_num',
      'Run_queue',
      'SessRate',
      'SessRateLimit',
      'SslBackendKeyRate',
      'SslBackendMaxKeyRate',
      'SslCacheLookups',
      'SslCacheMisses',
      'SslFrontendKeyRate',
      'SslFrontendMaxKeyRate',
      'SslFrontendSessionReuse_pct',
      'SslRate',
      'SslRateLimit',
      'Tasks',
      'Ulimit-n',
      'ZlibMemUsage',
      'bin',
      'bout',
      'chkdown',
      'chkfail',
      'comp_byp',
      'comp_in',
      'comp_out',
      'comp_rsp',
      'cli_abrt',
      'dreq',
      'dresp',
      'ereq',
      'eresp',
      'econ',
      'hrsp_1xx',
      'hrsp_2xx',
      'hrsp_3xx',
      'hrsp_4xx',
      'hrsp_5xx',
      'hrsp_other',
      'lbtot',
      'qcur',
      'qmax',
      'rate',
      'rate_lim',
      'rate_max',
      'req_rate',
      'req_rate_max',
      'req_tot',
      'scur',
      'slim',
      'srv_abrt',
      'smax',
      'stot',
      'wretr',
      'wredis'
    ];
  }

  static get METRICS_AVG() {
    return [
      'act',
      'bck',
      'check_duration',
      'ctime',
      'downtime',
      'lastchg',
      'lastsess',
      'qlimit',
      'qtime',
      'rtime',
      'throttle',
      'ttime',
      'weight'
    ];
  }

  /**
   * Return {true} if path is a valid UNIX socket otherwise {false}.
   *
   * @param {string} path file name path
   * @returns {boolean}
   */
  static isUnixSocket(path) {
    return fs.statSync(path).isSocket();
  }

  /**
   * Check if socket file is a valid HAProxy socket file.
   *
   * We send a 'show info' command to the socket, build a dictionary structure
   * and check if 'Name' key is present in the dictionary to confirm that
   * there is a HAProxy process connected to it.
   *
   * @param {string} path file name path
   * @returns {Promise<boolean>} {true} is socket file is a valid HAProxy stats socket file {false} otherwise
   */
  static async connectedSocket(path) {
    let unixSocket = new net.Socket(),
      buffer = '';

    unixSocket.setTimeout(0.1);

    return new Promise((resolve, reject) => {
      unixSocket
        .once('connect', () => unixSocket.end('show info' + '\n'))
        .on('data', chunk => (buffer += chunk))
        .once('error', err => {
          unixSocket.destroy();
          reject(err);
        })
        .once('end', () => {
          let data = buffer.trim().split('\n');
          if (data.length > 1 && data[data.length - 1] === '') data.pop();
          if (data.length == 0) {
            reject(Error('Parameter is not a number!'));
          } else {
            resolve(_Utils.info2dict(data));
          }
        });
    }).then(value => value['Name'] === 'HAProxy');
  }

  /**
   * Return the result of a command executed in all HAProxy process.
   *
   * NOTE: Objects must have a property with the name 'processNumber' which returns the HAProxy process number.
   *
   * @param {_HAProxyProcess[]} hapObjects a list of {@link _HAProxyProcess}
   * @param {string} method a valid method for the objects.
   * @returns {Promise<object[]>} list of 2-item tuples
   *   #. HAProxy process number
   *   #. what the method returned
   */
  static async commandAcrossAllProcesses(hapObjects, method, ...args) {
    return Promise.all(
      hapObjects.map(async _haProxyProcess => {
          return {
            [await _haProxyProcess.processNumber()]:
              await (args.length == 1
                ? _haProxyProcess[method](args[0])
                : _haProxyProcess[method].apply(_haProxyProcess, args))
          }
      })
    ).then(result => [].concat.apply([], result));
  }

  /**
   * Check is all elements of an iterator are equal.
   *
   * @param {object[]} iterator a iterator
   * @returns {boolean}
   */
  static elementsOfListSame(iterator) {
    return new Set(iterator).size == 1;
  }

  /**
   * Run an intersection test across values returned by processes.
   *
   * It is possible that not all processes return the same value for certain
   * keys(status, weight etc) due to various reasons. We must detect these cases
   * and either return the value which is the same across all processes or
   * raise :class:`<IncosistentData>`.
   *
   * @param {object[]} values a list of tuples with 2 elements.
   *   #. process number of HAProxy process returned the data
   *   #. value returned by HAProxy process.
   * @returns {string} value
   */
  static compareValues(values) {
    if (_Utils.elementsOfListSame(values.map(t => t[1]))) return values[0][1];

    throw Error('Inconsistent Values');
  }

  /**
   * Check if output contains any error.
   *
   * Several commands return output which we need to return back to the caller.
   * But, before we return anything back we want to perform a sanity check on
   * the output in order to catch wrong input as it is impossible to perform
   * any sanitization on values/patterns which are passed as input to the command.
   *
   * @param {string[]} output output of the command.
   * @returns {boolean} {true} if no errors found in output otherwise {false}.
   */
  static checkOutput(output) {
    return !CommandStatus.ERROR_OUTPUT_STRINGS.includes(output[0]);
  }

  /**
   * Check if command was successfully executed.
   *
   * After a command is executed. We care about the following cases:
   *  * The same output is returned by all processes
   *  * If output matches to a list of outputs which indicate that command was valid
   *
   * @param {object[]} results a list of tuples with 2 elements:
   *  #. process number of HAProxy
   *  #. message returned by HAProxy
   * @returns {boolean} {true} if command was successfully executed otherwise {false}.
   */
  static checkCommand(results) {
    if (_Utils.elementsOfListSame(results.map(msg => msg[1]))) {
      let msg = results[0][1];
      if (CommandStatus.SUCCESS_OUTPUT_STRINGS.includes(msg)) {
        return true;
      } else {
        throw util.format('command failed {}', msg);
      }
    }
    throw util.format('multiple command result {}', results);
  }

  /**
   * Check if command to set port or address was successfully executed.
   *
   * Unfortunately, HAProxy returns many different combinations of output when
   * we change the address or the port of the server and trying to determine
   * if address or port was successfully changed isn't that trivial.
   *
   * So, after we change address or port, we check if the same output is
   * returned by all processes and we also check if a collection of specific
   * strings are part of the output. This is a suboptimal solution, but I
   * couldn't come up with something more elegant.
   *
   * @param {string} change_type either 'addr' or 'port'
   * @param {object[]} results a list of tuples with 2 elements:
   *  #. process number of HAProxy
   *  #. message returned by HAProxy
   * @returns {boolean} {true} if command was successfully executed otherwise {false}.
   */
  static checkCommandAddressPort(change_type, results) {
    let _match;
    if ('addr' === change_type) {
      _match = CommandStatus.SUCCESS_STRING_ADDRESS;
    } else if ('port' === change_type) {
      _match = CommandStatus.SUCCESS_STRING_PORT;
    } else {
      throw 'invalid value for change_type';
    }
    if (_Utils.elementsOfListSame(results.map(msg => msg[1]))) {
      let msg = results[0][1];
      if (new RegExp(_match, msg)) {
        return true;
      } else {
        throw util.format('command failed {}', msg);
      }
    }
    throw util.format('multiple command result {}', results);
  }

  /**
   * Perform the appropriate calculation across a list of metrics.
   *
   * NOTE: Objects must have a property with the name 'processNumber' which returns the HAProxy process number.
   *
   * @param {string} name name of the metric.
   * @param {number[]} metrics a list of metrics
   * @returns {number} either the sum or the average of metrics.
   */
  static calculate(name, metrics) {
    if (!metrics) return 0;

    if (_Utils.METRICS_SUM.includes(name)) {
      return metrics.reduce((a, b) => a + b, 0);
    } else if (_Utils.METRICS_AVG.includes(name)) {
      return metrics.reduce((a, b) => a + b, 0) / metrics.length;
    }
    throw Error(util.format('Unknown type of calculation for {}', name));
  }

  /**
   * Check if input can be converted to an integer.
   *
   * NOTE: Objects must have a property with the name 'processNumber' which returns the HAProxy process number.
   *
   * @param {object} value value to check
   * @returns {boolean} {true} if value can be converted to an integer
   */
  static isInt(value) {
    return !isNaN(parseInt(value, 10));
  }

  /**
   * Tries to convert input value to an integer.
   *
   * If input can be safely converted to number it returns a number.
   * If input is a valid string but not an empty one it returns that.
   * In all other cases we return undefined, including the ones which an
   * exception is raised by parsing the number.
   * For floating point numbers, it truncates towards zero.
   *
   * Why are we doing this?
   * HAProxy may return for a metric either a number or zero or string or an
   * empty string.
   *
   * It is up to the caller to correctly use the returned value. If the returned
   * value is passed to a function which does math operations the caller has to
   * filtered out possible undefined values.

   *
   * @param {string} value a value to convert to a {@link number}.
   * @returns {(number|string)}
   */
  static converter(value) {
    try {
      return parseFloat(value) | 0;
    } catch (e) {
      return value.trim() || undefined;
    }
  }

  /**
   * Make an iterator that aggregates elements from each of the iterables.
   *
   * @param {array[]} iterables
   * @returns {object[]} an array of tuples, where the i-th tuple contains
   * the i-th element from each of the argument sequences or iterables
   */
  static zip(...iterables) {
    return iterables[0].map((_, i) => iterables.map(array => array[i]));
  }

  /**
   * Create a new dictionary.
   *
   * Each item in the iterable must itself be an iterable with exactly two objects.
   * The first object of each item becomes a key in the new dictionary, and the second
   * object the corresponding value. If a key occurs more than once, the last value
   * for that key becomes the corresponding value in the new dictionary.
   *
   * @param {object[]} iterable an iterable with exactly two objects
   * @returns {object} a dictionary-type object
   */
  static dict(iterable) {
    return Object.entries(iterable).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: value }),
      {}
    );
  }

  /**
   * Build a dictionary structure from the output of 'show info' command.
   *
   * @param {string[]} rawInfo data returned by 'show info' UNIX socket command
   * @returns {object} A dictionary with the following keys/values(examples)
   */
  static info2dict(rawInfo) {
    let info = {};
    rawInfo
      .map(x => x.trim())
      .filter(x => x.length && x.includes(': '))
      .forEach(value => {
        let line = value.split(': ', 2);
        info[line[0]] = line[1];
      });
    return info;
  }

  /**
   * Build a nested dictionary structure.
   *
   * @param {object[]} csvData data returned by 'show stat' command in a CSV format.
   * @returns {object} A nested dictionary with all counters/settings found in the input.
   */
  static stat2dict(csvData) {
    let heads = [],
      dicts = {
        backends: {},
        frontends: {}
      };
    // get the header line
    let headers = csvData.shift();

    // make a shiny list of heads
    heads = headers
      .slice(2)
      .trim()
      .split(',');

    // A line which holds frontend definition:
    // <frontend_name>,FRONTEND,....
    // A line holds server definition:
    // <backend_name>,<servername>,....
    // A line which holds backend definition:
    // <backend_name>,BACKEND,....
    // NOTE: we can have a single line for a backend definition without any
    // lines for servers associated with for that backend
    csvData
      .filter(t => t.trim())
      .filter(t => t.length)
      .forEach(line => {
        // make list of parts
        let parts = line.split(',');

        // each line is a distinct object
        let csvline = new _CSVLine(heads, parts);
        // parts[0] => pxname field, backend or frontend name
        // parts[1] => svname field, servername or BACKEND or FRONTEND
        if (parts[1] === 'FRONTEND') {
          // This is a frontend line.
          // Frontend definitions aren't spread across multiple lines.
          dicts['frontends'][parts[0]] = csvline;
        } else if (
          parts[1] === 'BACKEND' &&
          !dicts['backends'].hasOwnProperty(parts[0])
        ) {
          // I see this backend information for 1st time.
          dicts['backends'][parts[0]] = {};
          dicts['backends'][parts[0]]['servers'] = {};
          dicts['backends'][parts[0]]['stats'] = csvline;
        } else {
          if (!dicts['backends'].hasOwnProperty(parts[0])) {
            // This line holds server information for a backend I haven't
            // seen before, thus create the backend structure and store
            // server details.
            dicts['backends'][parts[0]] = {};
            dicts['backends'][parts[0]]['servers'] = {};
          }
          if (parts[1] === 'BACKEND') {
            dicts['backends'][parts[0]]['stats'] = csvline;
          } else {
            dicts['backends'][parts[0]]['servers'][parts[1]] = csvline;
          }
        }
      });
    return dicts;
  }
}

/**
 * @typedef {Object} _CSVLine
 */
class _CSVLine {
  /**
   * An object that holds field/value of a CSV line.
   *
   * The field name becomes the attribute of the class.
   * Needs the header line of CSV during instantiation.
   *
   * @param {string[]} heads
   * @param {string[]} parts A list with field values
   */
  constructor(heads, parts) {
    this._heads = heads;
    this._parts = parts;
  }

  get(attr) {
    return this._parts[this._heads.indexOf(attr)];
  }
}

module.exports = _Utils, _CSVLine;
