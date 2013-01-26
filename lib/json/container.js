function JSONContainer() {
    "use strict";

    this.bufferArray = [];
}

JSONContainer.prototype.write = function (data) {
    "use strict";

    this.bufferArray.push(data);
};

JSONContainer.prototype.getObject = function() {
    return JSON.parse(Buffer.concat(this.bufferArray).toString());
};

module.exports = JSONContainer;