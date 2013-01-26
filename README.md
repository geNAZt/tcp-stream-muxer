tcp-stream-muxer
=============

This library enables you to send multiple Streams over one connection. It uses Buffers to send data on the TCP channel. So the overhead is minimal.

To create a MuxServer (tcp server):
```javascript
var Muxer = require('tcp-stream-muxer');
var server = new Muxer.MuxServer(12345);
```

To create a MuxClient (tcp client):
```javascript
var Muxer = require('tcp-stream-muxer');
var server = new Muxer.MuxClient(12345);
```

The MuxServer is an EventEmitter with following events:
* connection - Emits when a new Client connects to a MuxServer

The connection also is an EventEmitter:
* stream - Emits if the Client creates a new Stream

Each Stream has a EventEmitter:
* data - The data that comes out of the stream
* end - If the Stream gets terminated

Each one, the Server and the Client, have a StreamPool per Connection. To access it you need a connection on the server. Creating new Streams in tcp-stream-muxer:

Server:
```javascript
var Muxer = require('tcp-stream-muxer');
var server = new Muxer.MuxServer(12345);
server.on('connection', function(con) {
    //Here you can access the connection StreamPool and create Streams
    var stream = con.StreamPool.createStream({type: "update", file: "xy.js"});
    stream.write(new Buffer("console.log('Hello');"));
});
```

The client that accepts this stream:
```javascript
var Muxer = require('tcp-stream-muxer');
var client = new Muxer.MuxClient(12345);
client.on('stream', function(stream) {
    console.log(stream.meta); //{type: "update", file: "xy.js"}
    stream.on('data', function (data) {
        console.log(data.toString()); //console.log('Hello');
    };
});
```

Client:
```javascript
var Muxer = require('tcp-stream-muxer');
var client = new Muxer.MuxClient(12345);
var stream = client.StreamPool.createStream({type: "update", file: "xy.js"});
stream.write(new Buffer("console.log('Hello');"));
```

The server that accepts this stream:
```javascript
var Muxer = require('tcp-stream-muxer');
var server = new Muxer.MuxServer(12345);
server.on('connection', function(con) {
    con.on('stream', function (stream) {
        console.log(stream.meta); //{type: "update", file: "xy.js"}
        stream.on('data', function (data) {
            console.log(data.toString()); //console.log('Hello');
        };
    }
});
```