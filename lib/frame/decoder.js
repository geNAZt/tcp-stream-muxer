var JSONContainer = require('../json/container');

/*
 length=length of the whole bufer object                                                                32bit int       1-4
 id=id of the stream                                                                                    8bit int        5
 type=Type of the Buffered Object (0=raw,1=json,2=new stream,3=binary end,4=ack for stream)             8bit int        6
 data=the data that needs to be sent                                                                    buffer          7-data
 */

function Decoder(streamPool) {
    "use strict";

    this.state = -1; //-1 new package, 0 => raw data, 1 => json data, 2 => new stream has connected
    this.length = 0; //Length of the Buffer till it is ended
    this.lengthParsed = 0; //Current Length that has been parsed
    this.streamPool = streamPool; //The current streampool
    this.streamID = null; //The current Stream that the data belongs to
    this.JSONContainer = new JSONContainer(); //The JSONContainer that holds JSON streams
}

Decoder.prototype.parsePackage = function (data) {
    "use strict";

    //Is the data empty ?
    if (data.length === 0) {
        return;
    }

    //The data that the current package holds
    var rawData;

    //Current there is no data that needs to be waited for
    if (this.state === -1) {
        //New Package arrives
        this.length = data.readUInt32BE(0); //How long should it be ?
        this.streamID = data.readUInt8(4); //To which stream should the data be written ?
        this.state = data.readUInt8(5); //What Package is this ?

        //Is the length of the package bigger then the data package ?
        if (this.length >= data.length) {
            rawData = data.slice(6);
            this.lengthParsed = rawData.length + 6;
        } else {
            rawData = data.slice(6, this.length); //Slice out the raw data
            this.lengthParsed = rawData.length + 6;
        }

        this.handleParsedData(rawData);

        //Is the package bigger then the data i need ?
        if (data.length > this.length) {
            this.state = -1; //Set state to new package
            this.parsePackage(data.slice(this.length)); //Parse the data that do not belong to us
        }
    } else {
        //We have a package that waits for data
        if (this.length > (data.length + this.lengthParsed)) {
            rawData = data;
            this.lengthParsed += rawData.length;
        } else {
            rawData = data.slice(0, this.length - this.lengthParsed); //Slice out the raw data
            this.lengthParsed += rawData.length;
        }

        this.handleParsedData(rawData);

        //Is there more ?
        if (this.lengthParsed < this.length) {
            return;
        }

        //Is the package bigger then the data i need ?
        if (data.length > rawData.length) {
            this.state = -1; //Set state to new package
            this.parsePackage(data.slice(rawData.length)); //Parse the data that do not belong to us
        }
    }
};

Decoder.prototype.handleParsedData = function (data) {
    "use strict";

    if (this.state === 1 || this.state === 2) {
        this.JSONContainer.write(data);

        if (this.length === this.lengthParsed) {
            var obj = this.JSONContainer.getObject();
            this.JSONContainer = new JSONContainer();

            if (this.state === 2) {
                this.streamPool.createStream(obj, this.streamID);
            } else {
                this.streamPool.emitData(this.streamID, obj);
            }

            this.state = -1;
        }
    } else if (this.state === 0) {
        this.streamPool.emitData(this.streamID, data);

        if (this.length === this.lengthParsed) {
            this.state = -1;
        }
    } else if (this.state === 3) {
        if (this.length === this.lengthParsed) {
            this.streamPool.emitEnd(this.streamID, (data.toString() !== "null") ? data : undefined);
            this.state = -1;
        }
    } else if (this.state === 4) {
        if (this.length === this.lengthParsed) {
            this.streamPool.ackCallback(this.streamID, (data.toString() !== "null") ? data : undefined);
            this.state = -1;
        }
    }
};

module.exports = Decoder;