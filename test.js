var Muxer = require('./lib/tcp-muxer.js');
var fs = require('fs');

var server = new Muxer.MuxServer(12345);
server.on('stream', function (stream) {
    "use strict";

    var fileWriteStream = fs.createWriteStream(stream.meta.file);
    stream.pipe(fileWriteStream);
});

var client = new Muxer.MuxClient(12345);
var stream = client.StreamPool.createStream({type: "update", file: "test1.png"});
var readStream = fs.createReadStream("test.png");
readStream.pipe(stream);