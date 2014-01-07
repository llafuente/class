(function (browser) {
    "use strict";

    if (browser) {
        // for browser variable is in NodeClass
        return;
    }

    require("function-enhancements");
    require("object-enhancements");
    require("array-enhancements");

    module.exports = require("./lib/class.js");
    module.exports.Events = require("./lib/events.js").Events;
    module.exports.Eventize = require("./lib/eventize.js").Eventize;
    module.exports.Iterable = require("./lib/iterable.js").Iterable;

}("undefined" === typeof module));

// this is for browser initialization!
var NodeClass = {};