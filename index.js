(function (exports, browser) {
    "use strict";

    require("function-enhancements");
    // vanilla
    var sugar = require("./lib/class.js"),
        i,
        once = false;

    module.exports = require("./lib/class.js");

    for(i in sugar) {
        module.exports[i] = sugar[i];
    }

    module.exports.populateTypes = function() {
        if(once === true) {
            return ;
        }
        once = true;

        RegExp.escape = sugar.RegExpEscape;
        Object.mergecloning = sugar.ObjectMergeCloning;
        Object.merge = sugar.ObjectMerge;
        Object.each = sugar.ObjectEach;
        Array.ize = sugar.ArrayIze;
        Array.clone = sugar.ArrayClone;
        Array.append = sugar.ArrayAppend;
        Array.insertAt = sugar.ArrayInsertAt;
    };

    // sugar
    module.exports.Eventize = require("./lib/eventize.js").Eventize;
    module.exports.Events = require("./lib/events.js").Events;
    module.exports.EventMachine = require("./lib/eventmachine.js").EventMachine;
    module.exports.Sequence = require("./lib/sequence.js").Sequence;
    module.exports.Iterable = require("./lib/iterable.js").Iterable;
    module.exports.Animate = require("./lib/animate.js").Animate;

}(typeof module == "undefined" ? $ : module.exports, typeof module == "undefined"));