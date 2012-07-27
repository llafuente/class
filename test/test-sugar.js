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
            "arguments": Array.ize(arguments)
        };
        console.log(this);
    };

test("function.args", function(t) {
    var t2 = function() {
        t.deepEqual(Array.ize(arguments), [ "say", "hello" ], "args error");
        t.deepEqual(this, {key: "value"}, "args error");
        t.end();

    }.args(["say", "hello"], {key: "value"});

    t2();
});


test("function.args2", function(t) {
    var t2 = function() {
        t.deepEqual(Array.ize(arguments), [ "say", "hello", "thidparam!" ], "args error");
        t.deepEqual(this, {key: "value"}, "args error");

        t.end();
    }.args(["say", "hello"], {key: "value"});

    t2("thidparam!");
});

test("function.pass", function(t) {
    var t2 = function() {
        t.deepEqual(Array.ize(arguments), [ "dont mind your args" ], "args error");
        t.deepEqual(this, {key: "value"}, "args error");
    }.pass(["dont mind your args"], {key: "value"});

    t2();
    t2("second - is not displayed!");
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


test("Array.ize", function(t) {
    t.deepEqual(Array.ize(arguments), [ t ], "from args error");
    var obj = {x:1};
    t.deepEqual(Array.ize(obj), [ obj ], "ize object error");
    var num = 1000;
    t.deepEqual(Array.ize(num), [ num ], "ize number error");
    var cls = new $.Class("test", {});
    t.deepEqual(Array.ize(cls), [ cls ], "ize Class error");
    var instance = new cls;
    t.deepEqual(Array.ize(instance), [ instance ], "ize Class instance error");
    t.end();
});





















