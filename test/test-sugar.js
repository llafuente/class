var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test,
    ArrayIze = require("../lib/sugar.js").ArrayIze;

//setup

//debug
$.log_level = 0;

var counter = 0,
    test_fn = function() {
        ++counter;

        return {
            "arguments": ArrayIze(arguments)
        };
        console.log(this);
    };


test("ArrayIze", function(t) {
    t.deepEqual(ArrayIze(arguments), [ t ], "from args error");
    var obj = {x:1};
    t.deepEqual(ArrayIze(obj), [ obj ], "ize object error");
    var num = 1000;
    t.deepEqual(ArrayIze(num), [ num ], "ize number error");
    var cls = new $.Class("test", {});
    t.deepEqual(ArrayIze(cls), [ cls ], "ize Class error");
    var instance = new cls;
    t.deepEqual(ArrayIze(instance), [ instance ], "ize Class instance error");
    t.end();
});





















