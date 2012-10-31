(function (exports, browser) {
    "use strict";

    // vanilla
    module.exports = require("./lib/class.js");

    // sugar
    module.exports.Eventize = require("./lib/eventize.js").Eventize;
    module.exports.Events = require("./lib/events.js").Events;
    module.exports.EventMachine = require("./lib/eventmachine.js").EventMachine;
    module.exports.Sequence = require("./lib/sequence.js").Sequence;
    module.exports.Iterable = require("./lib/iterable.js").Iterable;
    module.exports.Animate = require("./lib/animate.js").Animate;

}(typeof module == "undefined" ? $ : module.exports, typeof module == "undefined"));