var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var Vector = new $.Class("Vector2", {
    x: 1,
    recursive: {},
    cloned: null,
    __setx: null
});

var v = new Vector();

Vector.properties({y:1});

Vector.properties({recursive: {x: 1}});

Vector.property("setx", function() {
    return this.__setx;
}, function(new_val) {
    this.__setx = new_val;
}, false); //false to hide!

Vector.properties({recursive: {y: 1}});
Vector.hide(["cloned", "__setx"]);
Vector.seal();

var v = new Vector({x:10, y:10, recursive: {x:10}}),
    v2 = new Vector({x:10, y:10, recursive: {x:10}, cloned: v});

    console.log(v);
    console.log(v2);

    console.log(v2.cloned, v);

test("properties test", function(t) {
    // we can do this test anymore...
    //t.equal(Vector.prototype.x, 1,               "x error");
    //t.equal(Vector.prototype.y, 1,               "y error");
    //t.equal(Vector.prototype.recursive.x, 1,     "recursive.x error");
    //t.equal(Vector.prototype.recursive.y, 1,     "recursive.y error");
    //
    //t.equal(Vector.prototype.cloned, null,     "cloned error");

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

test("properties added after instanced should not be in the instances", function(t) {
    Vector.properties({emergency: "let's go!"});

    t.notEqual(v.emergency, undefined, "emergency error after init");
    t.notEqual(v2.emergency, undefined, "emergency error after init");

    t.end();
});

test("properties seal fail if instanced before!", function(t) {
    v2.emergency = null; // this not raise
    t.equal(v2.emergency, "let's go!", "emergency cant be modified, seal fail ?!");

    t.end();
});

test("properties cloned can be found in for in!", function(t) {
    var key;
    for(key in v2) {
        t.notEqual(key, "cloned", "cloned found ?!");
    }

    t.end();
});


var Objc = new $.Class("Vector2c", {
    data: {
        xx: true,
        yy: false
    }
});

    var a = new Objc(),
        b = new Objc();
        console.log("-----------------------------");
        console.log(a);
        console.log(b);
        console.log("-----------------------------");

test("properties must be cloned, object should not change in two instances", function(t) {
    a.data.xx = 100;

    t.notEqual(b.data.xx, 100, "both properties point the same var");

    t.end();
});


test("setter/getter", function(t) {
    v.setx = 100;

    t.equal(v.setx, 100, "getter");
    t.equal(v.__setx, 100, "settter");

    t.end();
});