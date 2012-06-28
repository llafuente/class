var $ = require("../index.js");
var assert = require("assert");

// nom install deep_equal @substack
var deep_equal = require("deep-equal");

//debug
$.log_level = 0;
var counter = 0;
var test = function() {
    ++counter;

    return {
        "arguments": Array.from(arguments)
    };
    console.log(this);
}


var t2 = test.args(["say", "hello"], {iamthis: true});

assert.equal(deep_equal(t2(), { arguments: [ "say", "hello" ] }), true, "args error");

assert.equal(deep_equal(t2("thidparam!"), { arguments: [ "say", "hello", "thidparam!" ] }), true, "args error 3");


var t3 = test.pass(["dont mind your args"], {whoami: "root"});

assert.equal(deep_equal(t3(), { arguments: ["dont mind your args"] }), true, "pass error");
assert.equal(deep_equal(t3("second - is not displayed!"), { arguments: ["dont mind your args"] }), true, "pass error");


counter = 0;

var t4 = test.throttle(1000);
var inter = t4.periodical(50);

setTimeout(function() {
    assert.equal(counter, 2, "sequence_1 error [" + counter + "] ");
    clearInterval(inter);
}, 1500);























