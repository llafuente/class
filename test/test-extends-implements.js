var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var Vector2 = new $.Class("Vector2", {
    x: 0,
    y:0
});

var Vector3 = new $.Class("Vector3", {
    z: 0,
});
// first extends
Vector3.Extends(Vector2);

//later implements only in vector 2
Vector2.Static({
    plus: function(a, b) {
        return new Vector2({x: a.x + b.x, y: a.y + b.y});
    }
});
Vector2.Implements({
    sub: function(b) {
        this.x -=b.x;
        this.y -=b.y;
    }
});

var a = new Vector2({x:5, y:5});
var b = new Vector2({x:5, y:5});

var c = new Vector3({x:10, y:10, z: 15});
var d = new Vector3({x:10, y:10, z: 20});


test("static test", function(t){
    t.deepEqual(a, {x:5, y:5}, "a ?");
    t.deepEqual(b, {x:5, y:5}, "b ?");
    t.deepEqual(Vector2.plus(a, b), {x:10, y:10}, "plus is ok!");
    t.deepEqual(a, {x:5, y:5}, "a has changed");
    t.deepEqual(b, {x:5, y:5}, "b has changed");


    t.deepEqual(c, {x:10, y:10, z: 15}, "c ?");
    t.deepEqual(d, {x:10, y:10, z: 20}, "d ?");

    t.deepEqual(Vector2.plus(c, d), {x:20, y:20}, "c+d (x+x, y+y) plus is ok!");
    t.deepEqual(Vector3.plus(c, d), {x:20, y:20}, "c+d (x+x, y+y) plus is ok!");

    c.sub(d);
    t.deepEqual(c, {x:0, y:0, z: 15}, "c-d (x-x, y-y, z) sub is ok!");


    t.end();
});
