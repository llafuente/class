var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var counter = 0,
    test_fn = function() {
        ++counter;

        return {
            "arguments": Array.from(arguments)
        };
        console.log(this);
    };

test("function.args", function(t) {

    var t2 = test_fn.args(["say", "hello"], {iamthis: true});

    t.deepEqual(t2(), { arguments: [ "say", "hello" ] }, "args error");

    t.deepEqual(t2("thidparam!"), { arguments: [ "say", "hello", "thidparam!" ] }, "args error 3");

    t.end();
});

test("function.pass", function(t) {
    var t3 = test_fn.pass(["dont mind your args"], {whoami: "root"});

    t.deepEqual(t3(), { arguments: ["dont mind your args"] }, "pass error");
    t.deepEqual(t3("second - is not displayed!"), { arguments: ["dont mind your args"] }, "pass error");

    t.end();
});


test("function.throttle & function.periodical", function(t) {

    counter = 0;

    var t4 = test_fn.throttle(1000);
    var inter = t4.periodical(50);

    setTimeout(function() {
        t.equal(counter, 2, "sequence_1 error [" + counter + "] ");
        clearInterval(inter);
        t.end();
    }, 1500);

});
























