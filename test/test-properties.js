var $ = require("../lib/class.js");
var assert = require("assert");

// nom install deep_equal @substack
var deep_equal = require("deep-equal");

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

console.log(Vector);

assert.equal(Vector.prototype.x, 1,               "x error");
assert.equal(Vector.prototype.y, 1,               "y error");
assert.equal(Vector.prototype.recursive.x, 1,     "recursive.x error");
assert.equal(Vector.prototype.recursive.y, 1,     "recursive.y error");

assert.equal(Vector.prototype.cloned, null,     "cloned error");


var v = new Vector({x:10, y:10, recursive: {x:10}});
var v2 = new Vector({x:10, y:10, recursive: {x:10}, cloned: v});

assert.equal(v.x, 10, "x error init");
assert.equal(v.y, 10, "y error init");
assert.equal(v.recursive.x, 10, "recursive.x error init");
assert.equal(v.recursive.y, 1, "recursive.y error init");

assert.equal(v.cloned, null, "cloned error init");

assert.equal(deep_equal(v2.cloned, v), true, "cloned error init");


Vector.properties({emergency: true});

assert.equal(v.emergency, true, "emergency error after init");
assert.equal(v2.emergency, true, "emergency error after init");
// emergency is not displayed!!!!


console.log(v);
console.log(v2);

//mess with new properties!
var v3 = new Vector({new_properties: 1, wtf: false});
console.log(v3);



