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
            con.StreamPool = new StreamPool(con);
            con.__frameDecoder = new Frame.Decoder(con.StreamPool);

            con.on('data', function (data) {
                con.__frameDecoder.parsePackage(data);
            });

            self.emit('connection', con);
        }).listen(port, ip);
}

util.inherits(MuxServer, events.EventEmitter);

function MuxClient(port, ip, cb) {
    "use strict";

    if (typeof ip === 'function') {
        cb = ip;
    }

    events.EventEmitter.call(this);

    var self = this,
        client = net.connect(port, ip, function () {
            client.on('data', function (data) {
                self.__frameDecoder.parsePackage(data);
            });

            client.on('stream', function (stream) {
                self.emit('stream', stream);
            });

            cb();
        });

    this.StreamPool = new StreamPool(client);
    this.__frameDecoder = new Frame.Decoder(this.StreamPool);
}

util.inherits(MuxClient, events.EventEmitter);

module.exports.MuxServer = MuxServer;
module.exports.MuxClient = MuxClient;
module.exports.util = require('./utils.js');