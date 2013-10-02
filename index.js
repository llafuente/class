(function (exports, browser) {
    "use strict";

    if (browser) {
        // for browser variable is in NodeClass
        return;
    }

    require("function-enhancements");
    require("object-enhancements");
    require("array-enhancements");
    // vanilla
    var sugar,
        i,
        once = false;

    module.exports = require("./lib/class.js");

    require("./lib/sugar.js");

    // sugar classes
    module.exports.Eventize = require("./lib/eventize.js").Eventize;
    module.exports.Events = require("./lib/events.js").Events;
    module.exports.EventMachine = require("./lib/eventmachine.js").EventMachine;
    module.exports.Sequence = require("./lib/sequence.js").Sequence;
    module.exports.Iterable = require("./lib/iterable.js").Iterable;
    module.exports.Animate = require("./lib/animate.js").Animate;

}(typeof module == "undefined" ? null : module.exports, typeof module == "undefined"));

// this is for browser initialization!
var NodeClass = {};