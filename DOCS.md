## Classes

<dl>
<dt><a href="#HAProxy">HAProxy</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#HAProxy">HAProxy</a> : <code>Object</code></dt>
<dd><p>This module implements the main HAProxy SDK.</p>
</dd>
</dl>

<a name="HAProxy"></a>

## HAProxy
**Kind**: global class

* [HAProxy](#HAProxy)
    * [new HAProxy(socket, [retry], [retry_interval], [timeout])](#new_HAProxy_new)
    * [.addAcl(acl, pattern)](#HAProxy+addAcl) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.addMap(map, key, value)](#HAProxy+addMap) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearAcl(acl)](#HAProxy+clearAcl) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearMap(map)](#HAProxy+clearMap) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearTable(table)](#HAProxy+clearTable) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearCounters([all])](#HAProxy+clearCounters) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.totalRequests()](#HAProxy+totalRequests) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.processIds()](#HAProxy+processIds) ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>
    * [.delAcl(acl, key)](#HAProxy+delAcl) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.delMap(map, key)](#HAProxy+delMap) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.delTable(table, key)](#HAProxy+delTable) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.errors([iid])](#HAProxy+errors) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
    * [.frontends([name])](#HAProxy+frontends) ⇒ <code>Promise.&lt;Array.&lt;Frontend&gt;&gt;</code>
    * [.frontend(name)](#HAProxy+frontend) ⇒ <code>Promise.&lt;Frontend&gt;</code>
    * [.getAcl(acl, value)](#HAProxy+getAcl) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.getMap(map, value)](#HAProxy+getMap) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.getTable(table, key)](#HAProxy+getTable) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.info()](#HAProxy+info) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
    * [.maxConn()](#HAProxy+maxConn) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.server(name, [backend])](#HAProxy+server) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
    * [.servers([backend])](#HAProxy+servers) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
    * [.metric(name)](#HAProxy+metric) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.backends([name])](#HAProxy+backends) ⇒ <code>Promise.&lt;Array.&lt;Backend&gt;&gt;</code>
    * [.backend(name)](#HAProxy+backend) ⇒ <code>Promise.&lt;Backend&gt;</code>
    * [.rateLimitConn()](#HAProxy+rateLimitConn) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.rateLimitSess()](#HAProxy+rateLimitSess) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.rateLimitSSLSess()](#HAProxy+rateLimitSSLSess) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.requests()](#HAProxy+requests) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.setMap(map, key, value)](#HAProxy+setMap) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.setTable(table, key, value)](#HAProxy+setTable) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.command(cmd)](#HAProxy+command) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
    * [.setMaxConn(value)](#HAProxy+setMaxConn) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.setRateLimitConn(value)](#HAProxy+setRateLimitConn) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.setRateLimitSession(value)](#HAProxy+setRateLimitSession) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.setRateLimitSSLSession(value)](#HAProxy+setRateLimitSSLSession) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.showAcl([acl])](#HAProxy+showAcl) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.showMap([map])](#HAProxy+showMap) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.showTable([name])](#HAProxy+showTable) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.uptime()](#HAProxy+uptime) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.description()](#HAProxy+description) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.nodeName()](#HAProxy+nodeName) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.uptimeSec()](#HAProxy+uptimeSec) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.releaseDate()](#HAProxy+releaseDate) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.version()](#HAProxy+version) ⇒ <code>Promise.&lt;string&gt;</code>

<a name="new_HAProxy_new"></a>

### new HAProxy(socket, [retry], [retry_interval], [timeout])
Build a user-created [HAProxy](#HAProxy) object for HAProxy.

This is the main class to interact with HAProxy and provides methods
to create objects for managing frontends, backends and servers. It also
provides an interface to interact with HAProxy as a way to
retrieve settings/statistics but also change settings.
ACLs and MAPs are also managed by [HAProxy](#HAProxy) class.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| socket | <code>string</code> |  | An object specifying either a directory with HAProxy stats files or an absolute path to a single HAProxy stats file. |
| [retry] | <code>number</code> | <code>2</code> | number of times to retry to open a UNIX socket connection after a failure occurred, possible values - NULL => don't retry - 0 => retry indefinitely - 1..N => times to retry |
| [retry_interval] | <code>number</code> | <code>2</code> | sleep time between the retries |
| [timeout] | <code>number</code> | <code>1</code> | timeout for the connection |

<a name="HAProxy+addAcl"></a>

### haProxy.addAcl(acl, pattern) ⇒ <code>Promise.&lt;boolean&gt;</code>
Add an entry into the acl.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |
| pattern | <code>string</code> | entry to add. |

<a name="HAProxy+addMap"></a>

### haProxy.addMap(map, key, value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Add an entry into the map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | acl id or a file. |
| key | <code>string</code> | key to add. |
| value | <code>string</code> | Value assciated to the key. |

<a name="HAProxy+clearAcl"></a>

### haProxy.clearAcl(acl) ⇒ <code>Promise.&lt;boolean&gt;</code>
Remove all entries from a acl.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |

<a name="HAProxy+clearMap"></a>

### haProxy.clearMap(map) ⇒ <code>Promise.&lt;boolean&gt;</code>
Remove all entries from a map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | acl id or a file. |

<a name="HAProxy+clearTable"></a>

### haProxy.clearTable(table) ⇒ <code>Promise.&lt;boolean&gt;</code>
Remove all entries from a stick-table.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name. |

<a name="HAProxy+clearCounters"></a>

### haProxy.clearCounters([all]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Clear the max values of the statistics counters.

When {all} is set to {true} clears all statistics counters in
each proxy (frontend & backend) and in each server. This has the same
effect as restarting.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [all] | <code>boolean</code> | <code>false</code> | clear all statistics counters |

<a name="HAProxy+totalRequests"></a>

### haProxy.totalRequests() ⇒ <code>Promise.&lt;number&gt;</code>
Return total cumulative number of requests processed by all processes.

This is the total number of requests that are processed by HAProxy.
It counts requests for frontends and backends. Don't forget that
a single client request passes HAProxy twice.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+processIds"></a>

### haProxy.processIds() ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>
Return the process IDs of all HAProxy processes.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+delAcl"></a>

### haProxy.delAcl(acl, key) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete all the acl entries from the acl corresponding to the key.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |
| key | <code>string</code> | key to delete. |

<a name="HAProxy+delMap"></a>

### haProxy.delMap(map, key) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete all the map entries from the map corresponding to the key.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | acl id or a file. |
| key | <code>string</code> | key to delete |

<a name="HAProxy+delTable"></a>

### haProxy.delTable(table, key) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete all entries from the stick-table corresponding to the key.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name |
| key | <code>string</code> | key to delete |

<a name="HAProxy+errors"></a>

### haProxy.errors([iid]) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
Dump last known request and response errors.

If <iid> is specified, the limit the dump to errors concerning
either frontend or backend whose ID is <iid>.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;object&gt;&gt;</code> - A list of tuples of errors per process.

| Param | Type | Description |
| --- | --- | --- |
| [iid] | <code>string</code> | ID of frontend or backend. |

<a name="HAProxy+frontends"></a>

### haProxy.frontends([name]) ⇒ <code>Promise.&lt;Array.&lt;Frontend&gt;&gt;</code>
Build a list of [Frontend](Frontend)s

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Frontend&gt;&gt;</code> - A list of [Frontend](Frontend)s.

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | frontend name to look up |

<a name="HAProxy+frontend"></a>

### haProxy.frontend(name) ⇒ <code>Promise.&lt;Frontend&gt;</code>
Build a [Frontend](Frontend) object.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Frontend&gt;</code> - A [Frontend](Frontend) object for the frontend.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | frontend name to look up. |

<a name="HAProxy+getAcl"></a>

### haProxy.getAcl(acl, value) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Lookup the value in the ACL.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - matching patterns associated with ACL.

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |
| value | <code>string</code> | to lookup |

<a name="HAProxy+getMap"></a>

### haProxy.getMap(map, value) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Lookup the value in the map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - matching patterns associated with map.

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | map id or a file. |
| value | <code>string</code> | to lookup |

<a name="HAProxy+getTable"></a>

### haProxy.getTable(table, key) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Lookup the key in the stick-table.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - matching patterns associated with map.

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name |
| key | <code>string</code> | key to lookup |

<a name="HAProxy+info"></a>

### haProxy.info() ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
Dump info about HAProxy stats on current process.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;object&gt;&gt;</code> - A list of objects for each process.
<a name="HAProxy+maxConn"></a>

### haProxy.maxConn() ⇒ <code>Promise.&lt;number&gt;</code>
Return the sum of configured maximum connections allowed for HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+server"></a>

### haProxy.server(name, [backend]) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
Build a [Server](Server) object.

If backend specified then lookup is limited to that backend.

NOTE: If a server is member of more than 1 backend then multiple objects for
the same server are returned.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code> - A list of [Server](Server)s.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | server name to look for. |
| [backend] | <code>string</code> | backend name to look in |

<a name="HAProxy+servers"></a>

### haProxy.servers([backend]) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
Build a list of [Server](Server)s

If backend specified then lookup is limited to that backend.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code> - A list of [Server](Server)s.

| Param | Type | Description |
| --- | --- | --- |
| [backend] | <code>string</code> | backend name |

<a name="HAProxy+metric"></a>

### haProxy.metric(name) ⇒ <code>Promise.&lt;number&gt;</code>
Return the value of a metric.

Performs a calculation on the metric across all HAProxy processes.
The type of calculation is either sum or avg and defined in
[_Utils.METRICS_SUM](_Utils.METRICS_SUM) and [_Utils.METRICS_AVG](_Utils.METRICS_AVG).

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;number&gt;</code> - value of the metric

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | metric name to retrieve. Any of [HAPROXY_METRICS](HAPROXY_METRICS) |

<a name="HAProxy+backends"></a>

### haProxy.backends([name]) ⇒ <code>Promise.&lt;Array.&lt;Backend&gt;&gt;</code>
Build a list of [Backend](Backend)s

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Backend&gt;&gt;</code> - A list of [Backend](Backend)s.

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | backend name to look up |

<a name="HAProxy+backend"></a>

### haProxy.backend(name) ⇒ <code>Promise.&lt;Backend&gt;</code>
Build a [Backend](Backend) object.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Backend&gt;</code> - A [Backend](Backend) object for the backend.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | backend name to look up. |

<a name="HAProxy+rateLimitConn"></a>

### haProxy.rateLimitConn() ⇒ <code>Promise.&lt;number&gt;</code>
Return the process-wide connection rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+rateLimitSess"></a>

### haProxy.rateLimitSess() ⇒ <code>Promise.&lt;number&gt;</code>
Return the process-wide session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+rateLimitSSLSess"></a>

### haProxy.rateLimitSSLSess() ⇒ <code>Promise.&lt;number&gt;</code>
Return the process-wide ssl session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+requests"></a>

### haProxy.requests() ⇒ <code>Promise.&lt;number&gt;</code>
Return total requests processed by all frontends.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+setMap"></a>

### haProxy.setMap(map, key, value) ⇒ <code>Promise.&lt;string&gt;</code>
Modify the value corresponding to each key in a map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;string&gt;</code> - matching patterns associated with map.

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | map id or a file. |
| key | <code>string</code> | id |
| value | <code>string</code> | to set for the key. |

<a name="HAProxy+setTable"></a>

### haProxy.setTable(table, key, value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Modify the value corresponding to each key in a stick-table.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name |
| key | <code>string</code> | key |
| value | <code>string</code> | to set for the key. |

<a name="HAProxy+command"></a>

### haProxy.command(cmd) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
Send a command to HAProxy process.

This allows a user to send any kind of command to HAProxy.
We **do not* perform any sanitization on input and on output.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;object&gt;&gt;</code> - list of 2-item tuple
 #. HAProxy process number
 #. what the method returned

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | a command to send to haproxy process. |

<a name="HAProxy+setMaxConn"></a>

### haProxy.setMaxConn(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set maximum connection to the frontend.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | value to set. |

<a name="HAProxy+setRateLimitConn"></a>

### haProxy.setRateLimitConn(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set process-wide connection rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | rate connection limit. |

<a name="HAProxy+setRateLimitSession"></a>

### haProxy.setRateLimitSession(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set process-wide session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | rate session limit. |

<a name="HAProxy+setRateLimitSSLSession"></a>

### haProxy.setRateLimitSSLSession(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set process-wide ssl session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | rate ssl session limit. |

<a name="HAProxy+showAcl"></a>

### haProxy.showAcl([acl]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Dump info about acls.

Without argument, the list of all available acls is returned.
If an acl id is specified, its contents are dumped.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - a list with the acls

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [acl] | <code>string</code> \| <code>number</code> | <code>&quot;NULL&quot;</code> | acl id or a file. |

<a name="HAProxy+showMap"></a>

### haProxy.showMap([map]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Dump info about maps.

Without argument, the list of all available maps is returned.
If a map id is specified, its contents are dumped.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - a list with the maps

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [map] | <code>string</code> \| <code>number</code> | <code>&quot;NULL&quot;</code> | map id or a file. |

<a name="HAProxy+showTable"></a>

### haProxy.showTable([name]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Dump info about stick-tables.

Without argument, the list of all available tables is returned.
If a table name is specified, its contents are dumped.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - a list with the tables

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>string</code> | <code>&quot;NULL&quot;</code> | table name. |

<a name="HAProxy+uptime"></a>

### haProxy.uptime() ⇒ <code>Promise.&lt;string&gt;</code>
Return uptime of HAProxy process.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+description"></a>

### haProxy.description() ⇒ <code>Promise.&lt;string&gt;</code>
Return description of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+nodeName"></a>

### haProxy.nodeName() ⇒ <code>Promise.&lt;string&gt;</code>
Return nodename of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+uptimeSec"></a>

### haProxy.uptimeSec() ⇒ <code>Promise.&lt;number&gt;</code>
Return uptime of HAProxy process in seconds.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+releaseDate"></a>

### haProxy.releaseDate() ⇒ <code>Promise.&lt;string&gt;</code>
Return release date of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+version"></a>

### haProxy.version() ⇒ <code>Promise.&lt;string&gt;</code>
Return version of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy"></a>

## HAProxy : <code>Object</code>
This module implements the main HAProxy SDK.

**Kind**: global typedef
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| _hap_processes | <code>Array.&lt;\_HAProxyProcess&gt;</code> | The HAProxy processes |


* [HAProxy](#HAProxy) : <code>Object</code>
    * [new HAProxy(socket, [retry], [retry_interval], [timeout])](#new_HAProxy_new)
    * [.addAcl(acl, pattern)](#HAProxy+addAcl) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.addMap(map, key, value)](#HAProxy+addMap) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearAcl(acl)](#HAProxy+clearAcl) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearMap(map)](#HAProxy+clearMap) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearTable(table)](#HAProxy+clearTable) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.clearCounters([all])](#HAProxy+clearCounters) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.totalRequests()](#HAProxy+totalRequests) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.processIds()](#HAProxy+processIds) ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>
    * [.delAcl(acl, key)](#HAProxy+delAcl) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.delMap(map, key)](#HAProxy+delMap) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.delTable(table, key)](#HAProxy+delTable) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.errors([iid])](#HAProxy+errors) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
    * [.frontends([name])](#HAProxy+frontends) ⇒ <code>Promise.&lt;Array.&lt;Frontend&gt;&gt;</code>
    * [.frontend(name)](#HAProxy+frontend) ⇒ <code>Promise.&lt;Frontend&gt;</code>
    * [.getAcl(acl, value)](#HAProxy+getAcl) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.getMap(map, value)](#HAProxy+getMap) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.getTable(table, key)](#HAProxy+getTable) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.info()](#HAProxy+info) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
    * [.maxConn()](#HAProxy+maxConn) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.server(name, [backend])](#HAProxy+server) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
    * [.servers([backend])](#HAProxy+servers) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
    * [.metric(name)](#HAProxy+metric) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.backends([name])](#HAProxy+backends) ⇒ <code>Promise.&lt;Array.&lt;Backend&gt;&gt;</code>
    * [.backend(name)](#HAProxy+backend) ⇒ <code>Promise.&lt;Backend&gt;</code>
    * [.rateLimitConn()](#HAProxy+rateLimitConn) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.rateLimitSess()](#HAProxy+rateLimitSess) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.rateLimitSSLSess()](#HAProxy+rateLimitSSLSess) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.requests()](#HAProxy+requests) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.setMap(map, key, value)](#HAProxy+setMap) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.setTable(table, key, value)](#HAProxy+setTable) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.command(cmd)](#HAProxy+command) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
    * [.setMaxConn(value)](#HAProxy+setMaxConn) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.setRateLimitConn(value)](#HAProxy+setRateLimitConn) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.setRateLimitSession(value)](#HAProxy+setRateLimitSession) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.setRateLimitSSLSession(value)](#HAProxy+setRateLimitSSLSession) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.showAcl([acl])](#HAProxy+showAcl) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.showMap([map])](#HAProxy+showMap) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.showTable([name])](#HAProxy+showTable) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.uptime()](#HAProxy+uptime) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.description()](#HAProxy+description) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.nodeName()](#HAProxy+nodeName) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.uptimeSec()](#HAProxy+uptimeSec) ⇒ <code>Promise.&lt;number&gt;</code>
    * [.releaseDate()](#HAProxy+releaseDate) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.version()](#HAProxy+version) ⇒ <code>Promise.&lt;string&gt;</code>

<a name="new_HAProxy_new"></a>

### new HAProxy(socket, [retry], [retry_interval], [timeout])
Build a user-created [HAProxy](#HAProxy) object for HAProxy.

This is the main class to interact with HAProxy and provides methods
to create objects for managing frontends, backends and servers. It also
provides an interface to interact with HAProxy as a way to
retrieve settings/statistics but also change settings.
ACLs and MAPs are also managed by [HAProxy](#HAProxy) class.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| socket | <code>string</code> |  | An object specifying either a directory with HAProxy stats files or an absolute path to a single HAProxy stats file. |
| [retry] | <code>number</code> | <code>2</code> | number of times to retry to open a UNIX socket connection after a failure occurred, possible values - NULL => don't retry - 0 => retry indefinitely - 1..N => times to retry |
| [retry_interval] | <code>number</code> | <code>2</code> | sleep time between the retries |
| [timeout] | <code>number</code> | <code>1</code> | timeout for the connection |

<a name="HAProxy+addAcl"></a>

### haProxy.addAcl(acl, pattern) ⇒ <code>Promise.&lt;boolean&gt;</code>
Add an entry into the acl.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |
| pattern | <code>string</code> | entry to add. |

<a name="HAProxy+addMap"></a>

### haProxy.addMap(map, key, value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Add an entry into the map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | acl id or a file. |
| key | <code>string</code> | key to add. |
| value | <code>string</code> | Value assciated to the key. |

<a name="HAProxy+clearAcl"></a>

### haProxy.clearAcl(acl) ⇒ <code>Promise.&lt;boolean&gt;</code>
Remove all entries from a acl.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |

<a name="HAProxy+clearMap"></a>

### haProxy.clearMap(map) ⇒ <code>Promise.&lt;boolean&gt;</code>
Remove all entries from a map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | acl id or a file. |

<a name="HAProxy+clearTable"></a>

### haProxy.clearTable(table) ⇒ <code>Promise.&lt;boolean&gt;</code>
Remove all entries from a stick-table.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name. |

<a name="HAProxy+clearCounters"></a>

### haProxy.clearCounters([all]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Clear the max values of the statistics counters.

When {all} is set to {true} clears all statistics counters in
each proxy (frontend & backend) and in each server. This has the same
effect as restarting.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [all] | <code>boolean</code> | <code>false</code> | clear all statistics counters |

<a name="HAProxy+totalRequests"></a>

### haProxy.totalRequests() ⇒ <code>Promise.&lt;number&gt;</code>
Return total cumulative number of requests processed by all processes.

This is the total number of requests that are processed by HAProxy.
It counts requests for frontends and backends. Don't forget that
a single client request passes HAProxy twice.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+processIds"></a>

### haProxy.processIds() ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>
Return the process IDs of all HAProxy processes.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+delAcl"></a>

### haProxy.delAcl(acl, key) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete all the acl entries from the acl corresponding to the key.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |
| key | <code>string</code> | key to delete. |

<a name="HAProxy+delMap"></a>

### haProxy.delMap(map, key) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete all the map entries from the map corresponding to the key.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | acl id or a file. |
| key | <code>string</code> | key to delete |

<a name="HAProxy+delTable"></a>

### haProxy.delTable(table, key) ⇒ <code>Promise.&lt;boolean&gt;</code>
Delete all entries from the stick-table corresponding to the key.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name |
| key | <code>string</code> | key to delete |

<a name="HAProxy+errors"></a>

### haProxy.errors([iid]) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
Dump last known request and response errors.

If <iid> is specified, the limit the dump to errors concerning
either frontend or backend whose ID is <iid>.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;object&gt;&gt;</code> - A list of tuples of errors per process.

| Param | Type | Description |
| --- | --- | --- |
| [iid] | <code>string</code> | ID of frontend or backend. |

<a name="HAProxy+frontends"></a>

### haProxy.frontends([name]) ⇒ <code>Promise.&lt;Array.&lt;Frontend&gt;&gt;</code>
Build a list of [Frontend](Frontend)s

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Frontend&gt;&gt;</code> - A list of [Frontend](Frontend)s.

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | frontend name to look up |

<a name="HAProxy+frontend"></a>

### haProxy.frontend(name) ⇒ <code>Promise.&lt;Frontend&gt;</code>
Build a [Frontend](Frontend) object.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Frontend&gt;</code> - A [Frontend](Frontend) object for the frontend.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | frontend name to look up. |

<a name="HAProxy+getAcl"></a>

### haProxy.getAcl(acl, value) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Lookup the value in the ACL.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - matching patterns associated with ACL.

| Param | Type | Description |
| --- | --- | --- |
| acl | <code>string</code> \| <code>number</code> | acl id or a file. |
| value | <code>string</code> | to lookup |

<a name="HAProxy+getMap"></a>

### haProxy.getMap(map, value) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Lookup the value in the map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - matching patterns associated with map.

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | map id or a file. |
| value | <code>string</code> | to lookup |

<a name="HAProxy+getTable"></a>

### haProxy.getTable(table, key) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Lookup the key in the stick-table.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - matching patterns associated with map.

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name |
| key | <code>string</code> | key to lookup |

<a name="HAProxy+info"></a>

### haProxy.info() ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
Dump info about HAProxy stats on current process.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;object&gt;&gt;</code> - A list of objects for each process.
<a name="HAProxy+maxConn"></a>

### haProxy.maxConn() ⇒ <code>Promise.&lt;number&gt;</code>
Return the sum of configured maximum connections allowed for HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+server"></a>

### haProxy.server(name, [backend]) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
Build a [Server](Server) object.

If backend specified then lookup is limited to that backend.

NOTE: If a server is member of more than 1 backend then multiple objects for
the same server are returned.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code> - A list of [Server](Server)s.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | server name to look for. |
| [backend] | <code>string</code> | backend name to look in |

<a name="HAProxy+servers"></a>

### haProxy.servers([backend]) ⇒ <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code>
Build a list of [Server](Server)s

If backend specified then lookup is limited to that backend.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Server&gt;&gt;</code> - A list of [Server](Server)s.

| Param | Type | Description |
| --- | --- | --- |
| [backend] | <code>string</code> | backend name |

<a name="HAProxy+metric"></a>

### haProxy.metric(name) ⇒ <code>Promise.&lt;number&gt;</code>
Return the value of a metric.

Performs a calculation on the metric across all HAProxy processes.
The type of calculation is either sum or avg and defined in
[_Utils.METRICS_SUM](_Utils.METRICS_SUM) and [_Utils.METRICS_AVG](_Utils.METRICS_AVG).

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;number&gt;</code> - value of the metric

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | metric name to retrieve. Any of [HAPROXY_METRICS](HAPROXY_METRICS) |

<a name="HAProxy+backends"></a>

### haProxy.backends([name]) ⇒ <code>Promise.&lt;Array.&lt;Backend&gt;&gt;</code>
Build a list of [Backend](Backend)s

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;Backend&gt;&gt;</code> - A list of [Backend](Backend)s.

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | backend name to look up |

<a name="HAProxy+backend"></a>

### haProxy.backend(name) ⇒ <code>Promise.&lt;Backend&gt;</code>
Build a [Backend](Backend) object.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Backend&gt;</code> - A [Backend](Backend) object for the backend.

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | backend name to look up. |

<a name="HAProxy+rateLimitConn"></a>

### haProxy.rateLimitConn() ⇒ <code>Promise.&lt;number&gt;</code>
Return the process-wide connection rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+rateLimitSess"></a>

### haProxy.rateLimitSess() ⇒ <code>Promise.&lt;number&gt;</code>
Return the process-wide session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+rateLimitSSLSess"></a>

### haProxy.rateLimitSSLSess() ⇒ <code>Promise.&lt;number&gt;</code>
Return the process-wide ssl session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+requests"></a>

### haProxy.requests() ⇒ <code>Promise.&lt;number&gt;</code>
Return total requests processed by all frontends.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+setMap"></a>

### haProxy.setMap(map, key, value) ⇒ <code>Promise.&lt;string&gt;</code>
Modify the value corresponding to each key in a map.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;string&gt;</code> - matching patterns associated with map.

| Param | Type | Description |
| --- | --- | --- |
| map | <code>string</code> \| <code>number</code> | map id or a file. |
| key | <code>string</code> | id |
| value | <code>string</code> | to set for the key. |

<a name="HAProxy+setTable"></a>

### haProxy.setTable(table, key, value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Modify the value corresponding to each key in a stick-table.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| table | <code>string</code> | table name |
| key | <code>string</code> | key |
| value | <code>string</code> | to set for the key. |

<a name="HAProxy+command"></a>

### haProxy.command(cmd) ⇒ <code>Promise.&lt;Array.&lt;object&gt;&gt;</code>
Send a command to HAProxy process.

This allows a user to send any kind of command to HAProxy.
We **do not* perform any sanitization on input and on output.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;object&gt;&gt;</code> - list of 2-item tuple
 #. HAProxy process number
 #. what the method returned

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>string</code> | a command to send to haproxy process. |

<a name="HAProxy+setMaxConn"></a>

### haProxy.setMaxConn(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set maximum connection to the frontend.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | value to set. |

<a name="HAProxy+setRateLimitConn"></a>

### haProxy.setRateLimitConn(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set process-wide connection rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | rate connection limit. |

<a name="HAProxy+setRateLimitSession"></a>

### haProxy.setRateLimitSession(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set process-wide session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | rate session limit. |

<a name="HAProxy+setRateLimitSSLSession"></a>

### haProxy.setRateLimitSSLSession(value) ⇒ <code>Promise.&lt;boolean&gt;</code>
Set process-wide ssl session rate limit.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;boolean&gt;</code> - {true} if command succeeds otherwise {false}

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | rate ssl session limit. |

<a name="HAProxy+showAcl"></a>

### haProxy.showAcl([acl]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Dump info about acls.

Without argument, the list of all available acls is returned.
If an acl id is specified, its contents are dumped.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - a list with the acls

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [acl] | <code>string</code> \| <code>number</code> | <code>&quot;NULL&quot;</code> | acl id or a file. |

<a name="HAProxy+showMap"></a>

### haProxy.showMap([map]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Dump info about maps.

Without argument, the list of all available maps is returned.
If a map id is specified, its contents are dumped.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - a list with the maps

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [map] | <code>string</code> \| <code>number</code> | <code>&quot;NULL&quot;</code> | map id or a file. |

<a name="HAProxy+showTable"></a>

### haProxy.showTable([name]) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Dump info about stick-tables.

Without argument, the list of all available tables is returned.
If a table name is specified, its contents are dumped.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - a list with the tables

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [name] | <code>string</code> | <code>&quot;NULL&quot;</code> | table name. |

<a name="HAProxy+uptime"></a>

### haProxy.uptime() ⇒ <code>Promise.&lt;string&gt;</code>
Return uptime of HAProxy process.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+description"></a>

### haProxy.description() ⇒ <code>Promise.&lt;string&gt;</code>
Return description of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+nodeName"></a>

### haProxy.nodeName() ⇒ <code>Promise.&lt;string&gt;</code>
Return nodename of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+uptimeSec"></a>

### haProxy.uptimeSec() ⇒ <code>Promise.&lt;number&gt;</code>
Return uptime of HAProxy process in seconds.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+releaseDate"></a>

### haProxy.releaseDate() ⇒ <code>Promise.&lt;string&gt;</code>
Return release date of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
<a name="HAProxy+version"></a>

### haProxy.version() ⇒ <code>Promise.&lt;string&gt;</code>
Return version of HAProxy.

**Kind**: instance method of [<code>HAProxy</code>](#HAProxy)
