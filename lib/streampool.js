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

StreamPool.prototype.emitToStream = function (id, data) {
    "use strict";

    if (typeof this.streams[id] === 'undefined') {
        console.log(id);
    } else {
        this.streams[id].write(data);
    }
};

StreamPool.prototype.emitEnd = function (id, data) {
    "use strict";

    if (typeof this.streams[id] === 'undefined') {
        console.log(id);
    } else {
        this.streams[id].end(data);
    }
};

StreamPool.prototype.createStream = function (meta, paraId) {
    "use strict";

    var stream = new Stream(),
        self = this;

    stream.writeable = stream.readable = true;
    stream.pause = false;

    if (typeof paraId !== 'undefined') {
        this.streams[paraId] = stream;
        stream.id = paraId;
    } else {
        var id = this.getNextFreeID();
        this.streams[id] = stream;
        stream.id = id;
    }

    stream.meta = meta;

    stream.write = function (data) {
        if (typeof paraId !== 'undefined') {
            this.emit('data', data);
        } else {
            self.con.write(FrameCoder.Encoder(stream.id, 0, data));
        }
    };

    stream.end = function (data) {
        if (typeof data !== 'undefined') {
            if (typeof paraId !== 'undefined') {
                stream.emit('end', data);
            } else {
                self.con.write(FrameCoder.Encoder(stream.id, 3, data));
            }
        } else {
            if (typeof paraId !== 'undefined') {
                stream.emit('end');
            } else {
                self.con.write(FrameCoder.Encoder(stream.id, 3, null));
            }
        }

        delete self.streams[stream.id];
    };

    if (typeof paraId === 'undefined') {
        this.con.write(FrameCoder.Encoder(stream.id, 2, meta));
    } else {
        this.con.emit('stream', stream);
    }

    return stream;
};

module.exports = StreamPool;