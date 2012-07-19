var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var Vector = $.Class("Vector2", {
    x: 1,
    recursive: {},
    cloned: null
});

Vector.properties({y:1});

Vector.properties({recursive: {x: 1}});

Vector.properties({recursive: {y: 1}});

var v = new Vector({x:10, y:10, recursive: {x:10}}),
    v2 = new Vector({x:10, y:10, recursive: {x:10}, cloned: v});

test("properties test", function(t) {
    t.equal(Vector.prototype.x, 1,               "x error");
    t.equal(Vector.prototype.y, 1,               "y error");
    t.equal(Vector.prototype.recursive.x, 1,     "recursive.x error");
    t.equal(Vector.prototype.recursive.y, 1,     "recursive.y error");

    t.equal(Vector.prototype.cloned, null,     "cloned error");

    t.end();
});

test("properties test instanced 2", function(t) {
    t.equal(v.x, 10, "x error init");
    t.equal(v.y, 10, "y error init");
    t.equal(v.recursive.x, 10, "recursive.x error init");
    t.equal(v.recursive.y, 1, "recursive.y error init");

    t.equal(v.cloned, null, "cloned error init");

    t.deepEqual(v2.cloned, v, "cloned error init");

    t.end();
});

test("properties add after instanced", function(t) {
    Vector.properties({emergency: true});

    t.equal(v.emergency, true, "emergency error after init");
    t.equal(v2.emergency, true, "emergency error after init");

    t.end();
});

test("properties seal fail if instanced before!", function(t) {
    v2.emergency = null; // this not raise
    t.equal(v2.emergency, true, "emergency cant be modified, seal fail ?!");

    t.end();
});

