var fs = require('fs');

module.exports.sendFile = function (file, stream) {
    "use strict";

    var readStream = fs.createReadStream(file);
    readStream.on('data', function (data) {
        stream.write(data);
    });

    readStream.on('end', function (data) {
        stream.end(data);
    });
};

module.exports.receiveFile = function (file, stream) {
    "use strict";

    var writeStream = fs.createWriteStream(file);
    stream.pipe(writeStream);
};