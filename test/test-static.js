var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var Vector = new $.Class("Vector", {
    x: 0,
    y:0
});

Vector.Static({
    plus: function(a, b) {
        return new Vector({x: a.x + b.x, y: a.y + b.y});
    }
});

var a = new Vector({x:5, y:5});
var b = new Vector({x:5, y:5});


test("static test", function(t){
    t.deepEqual(a, {x:5, y:5}, "a ?");
    t.deepEqual(b, {x:5, y:5}, "b ?");
    t.deepEqual(Vector.plus(a, b), {x:10, y:10}, "plus is ok!");
    t.deepEqual(a, {x:5, y:5}, "a has changed");
    t.deepEqual(b, {x:5, y:5}, "b has changed");

    t.end();
});
