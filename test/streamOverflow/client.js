var Muxer = require('../../lib/tcp-muxer.js');

var client = new Muxer.MuxClient(12345, function () {
    setInterval(function () {
        client.StreamPool.createStream({test: 1}, function (stream) {

        });
    }, 100);
});