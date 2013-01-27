var Muxer = require('../lib/tcp-muxer.js');
var bytes = {bufferSize: 0, tcpSize: 0};

var server = new Muxer.MuxServer(12345);
server.on('connection', function (con) {
    //Here you can access the connection StreamPool and create Streams
    con.StreamPool.createStream({type: "update", file: "xy.js"}, function (stream) {
        var buffer = new Buffer("console.log('Hello');");
        setInterval(function () {
            bytes.bufferSize += buffer.length;
            stream.write(buffer);
        }, 2);
    });
});

var client = new Muxer.MuxClient(12345, function () {
    client.on('stream', function (stream) {
        stream.on('data', function (data) {
            bytes.tcpSize = client.connection.bytesRead;
        });
    });
});

setInterval(function () {
    console.log((bytes.tcpSize / bytes.bufferSize) + " % overhead");
}, 1000);