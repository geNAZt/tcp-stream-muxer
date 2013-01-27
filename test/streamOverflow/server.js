var Muxer = require('../../lib/tcp-muxer.js');

var server = new Muxer.MuxServer(12345);
server.on('connection', function (con) {

});