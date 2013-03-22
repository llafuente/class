var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//debug
$.log_level = 0;

test("call populateTypes", function(t) {

    $.populateTypes();

    t.end();
});
