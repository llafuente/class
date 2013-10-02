(function (exports, browser) {
    "use strict";

    // here you can find many helpers function in static for performance
    // the exception are functions that are in the prototype

    var $;

    if (browser) {
        $ = exports;
    } else {
        $ = require("./class.js");
    }

    //
    // Object
    //

    // define Object.defineProperty if not found, no functionality just a replacement so your code not throw!
    if (!Object.defineProperty) {
        Object.defineProperty = function (obj, name, prop) {
            if (prop.get || prop.set) {
                throw new Error("this is not supported in your js.engine");
            }
            obj[name] = prop.value;
        };
    }


    // define Object.seal if not found, no functionality just a replacement so your code not throw!
    if (!Object.seal) {
        Object.seal = function (obj) {
            return obj;
        };
    }

    var defineProperty = Object.defineProperty,
        slice = Array.prototype.slice;

}(typeof module === "undefined" ? NodeClass : module.exports, typeof module === "undefined"));
