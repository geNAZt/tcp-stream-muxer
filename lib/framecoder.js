/*
 length=length of the whole bufer object                                32bit int       1-4
 id=id of the stream                                                    8bit int        5
 type=Type of the Buffered Object (0=raw,1=json,2=new stream)           8bit int        6
 data=the data that needs to be sent                                    buffer          7-data
 */

function encodeFrame(id, type, data) {
    "use strict";

    var mode = 0;

    if (!Buffer.isBuffer(data)) {
        data = new Buffer(JSON.stringify(data));
        mode = (type !== null) ? type : 1;
    }

    var buffer = new Buffer(6 + data.length);
    buffer.writeInt32BE(buffer.length, 0);
    buffer.writeInt8(id, 4);
    buffer.writeInt8(mode, 5);
    data.copy(buffer, 6);

    return buffer;
}

module.exports.Encoder = encodeFrame;
module.exports.Decoder = require('./frame/decoder');