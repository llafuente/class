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





















