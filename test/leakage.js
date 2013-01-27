var Muxer = require('../lib/tcp-muxer.js');

var server = new Muxer.MuxServer(12345);
server.on('connection', function (con) {
    //Here you can access the connection StreamPool and create Streams
    con.StreamPool.createStream({type: "update", file: "xy.js"}, function (stream) {
        var buffer = new Buffer("console.log('Hello');");
        setInterval(function () {
            stream.write(buffer);
        }, 2);
    });
});

var client = new Muxer.MuxClient(12345, function () {
    client.on('stream', function (stream) {
        stream.on('data', function (data) {

        });
    });
});

setInterval(function () {
    console.log(process.memoryUsage().heapUsed + " bytes heapUsed");
}, 1000);