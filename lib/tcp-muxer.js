var net = require('net');
var StreamPool = require('./streampool.js');
var Frame = require('./framecoder.js');
var events = require('events');
var util = require('util');

function MuxServer(port, ip) {
    "use strict";

    events.EventEmitter.call(this);
    var self = this,
        server = net.createServer(function (con) {
            con.streamPool = new StreamPool(con);
            con.frameDecoder = new Frame.Decoder(con.streamPool);

            con.on('data', function (data) {
                con.frameDecoder.parsePackage(data);
            });

            con.on('stream', function (stream) {
                self.emit('stream', stream);
            });
        }).listen(port, ip);
}

util.inherits(MuxServer, events.EventEmitter);

function MuxClient(port, ip) {
    "use strict";
    var client = net.connect(port, ip, function () {
        client.on('data', function (data) {

        });
    });

    this.StreamPool = new StreamPool(client);
}

module.exports.MuxServer = MuxServer;
module.exports.MuxClient = MuxClient;