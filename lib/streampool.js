var Stream = require('stream');
var FrameCoder = require('./framecoder.js');

function StreamPool(con) {
    "use strict";

    this.streams = {};
    this.con = con;
}

StreamPool.prototype.add = function (id, stream) {
    "use strict";

    this.streams.id = stream;

    return stream;
};

StreamPool.prototype.getNextFreeID = function () {
    "use strict";

    var i = 0;
    for (i = 0; i < 255; i += 1) {
        if (typeof this.streams[i] === "undefined") {
            return i;
        }
    }

    throw new Error("Maximum of Streams per Connection is reached (255)");
};

StreamPool.prototype.emitData = function (id, data) {
    "use strict";

    if (typeof this.streams[id] === 'undefined') {
        throw new Error("Emitting Data for Stream with ID " + id + ". The Stream does not exist");
    } else {
        this.streams[id].write(data);
    }
};

StreamPool.prototype.emitEnd = function (id, data) {
    "use strict";

    if (typeof this.streams[id] === 'undefined') {
        throw new Error("Emitting End for Stream with ID " + id + ". The Stream does not exist");
    } else {
        this.streams[id].end(data);
    }
};

StreamPool.prototype.ackCallback = function (id) {
    "use strict";

    if (typeof this.streams[id] === 'undefined') {
        throw new Error("ACK Package for Stream with ID " + id + ". The Stream does not exist");
    } else {
        if (typeof this.streams[id].ackCallback === 'function') {
            //console.log("ACK Package for Stream with ID " + id + " received. ACK Callback gets called");
            this.streams[id].ackCallback(this.streams[id]);
        }
    }
};

StreamPool.prototype.createStream = function (meta, paraId, cb) {
    "use strict";

    if (typeof paraId === 'function') {
        cb = paraId;
        paraId = undefined;
    }

    var stream = new Stream(),
        self = this;

    stream.writeable = stream.readable = true;
    stream.pause = stream.resume = false;
    stream.ackCallback = cb;

    if (typeof paraId !== 'undefined') {
        this.streams[paraId] = stream;
        stream.id = paraId;
    } else {
        var id = this.getNextFreeID();
        this.streams[id] = stream;
        stream.id = id;
    }

    //console.log("Creating new Stream with ID: " + ((typeof paraId !== 'undefined') ? paraId : id) + " Meta:", meta);

    stream.meta = meta;

    stream.write = function (data) {
        if (typeof paraId !== 'undefined') {
            //console.log("Emitting data for Stream with ID: " + paraId + " Data length: " + data.length);
            this.emit('data', data);
        } else {
            //console.log("Sending data for Stream with ID: " + stream.id + " Data length: " + data.length);
            self.con.write(FrameCoder.Encoder(stream.id, 0, data));
        }

        //We have emitted the data to all listeners so set it to null and tell the gc it can be destroyed
        data = null;

        return true;
    };

    stream.end = function (data) {
        if (typeof data !== 'undefined') {
            if (typeof paraId !== 'undefined') {
                //console.log("Emitting end with Data for Stream with ID: " + paraId + " Data length: " + data.length);
                stream.emit('end', data);
            } else {
                //console.log("Sending end with Data for Stream with ID: " + stream.id + " Data length: " + data.length);
                self.con.write(FrameCoder.Encoder(stream.id, 3, data));
            }

            //Unset the data which has been emitted
            data = null;
        } else {
            if (typeof paraId !== 'undefined') {
                //console.log("Emitting end for Stream with ID: " + paraId);
                stream.emit('end');
            } else {
                //console.log("Sending end for Stream with ID: " + stream.id);
                self.con.write(FrameCoder.Encoder(stream.id, 3, null));
            }
        }

        //Unset the Stream, it has ended
        self.streams[stream.id] = null;
    };

    if (typeof paraId === 'undefined') {
        //console.log("Sending Stream Data for Stream with ID: " + stream.id + " Meta:", meta);
        this.con.write(FrameCoder.Encoder(stream.id, 2, meta));
    } else {
        //console.log("Emitting Stream Data for Stream with ID: " + stream.id + " Meta:", stream.meta);
        this.con.emit('stream', stream);
        //console.log("Sending ACK Package for Stream with ID: " + stream.id + " Meta:", stream.meta);
        this.con.write(FrameCoder.Encoder(stream.id, 4, null));
    }
};

module.exports = StreamPool;