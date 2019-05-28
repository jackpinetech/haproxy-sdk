# haproxy-sdk

*haproxy-sdk* provides a Javascript-native, Promise-based development library to the "stats" socket of HAProxy.
 
From this library, users can enable/disable servers and frontends, manage backends, query stats, and much more.
 
HAProxy is a multi-process daemon and each process can only be accessed by a distinct stats socket.
There isn't any shared memory for all these processes. That means that if a frontend or backend is
managed by more than one processes, you have to find which stats socket you need to send the query/command.
This makes the life of a sysadmin a bit difficult as he has to keep track of which stats socket to use for
a given object(frontend/backend/server).

*haproxy-sdk* resolves this problem by presenting objects as single entities even when they are managed by multiple
processes. It also supports aggregation for various statistics provided by HAProxy. For instance, to report the requests
processed by a frontend, it queries all processes which manage that frontend and returns the sum.

# Features

* HAProxy in multi-process mode (`nbproc` >1)
* UNIX stats socket, no support for querying HTTP statistics page
* Frontend operations
* Backend operations
* Server operations
* ACL operations
* MAP operations
* stick-table operations
* Aggregation on various statistics
* Change global options for HAProxy

# Installation

The package is released in `npm`, the Node.js package registry. To add it as a dependency to any project, do:

```
npm install haproxy-sdk --save
```

# Usage

```
var HAProxy = require('haproxy-sdk');

var haproxy = new HAProxy('/run/socket/path.sock');
```

# Licensing

The MIT License (MIT)

Copyright (c) 2019 Jackpine Technologies Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Changelog

You can find the changelog for the project in: [CHANGELOG.md](https://github.com/jackpinetech/haproxy-sdk/blob/master/CHANGELOG.md)

# Acknowledgement

This project is largely a Javascript port of the Python library `haproxyadmin`, which is published as Open Source on
github.
