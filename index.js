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

}("undefined" === typeof module));

// this is for browser initialization!
var NodeClass = {};