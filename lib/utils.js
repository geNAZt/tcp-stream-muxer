var fs = require('fs');

module.exports.sendFile = function (file, stream) {
    "use strict";

    var readStream = fs.createReadStream(file);
    readStream.pipe(stream);
};

module.exports.receiveFile = function (file, stream) {
    "use strict";

    var writeStream = fs.createWriteStream(file);
    stream.pipe(writeStream);
};