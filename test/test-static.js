var $ = require("../lib/class.js");
var assert = require("assert");

// nom install deep_equal @substack
var deep_equal = require("deep-equal");

//debug
$.log_level = 0;

var Vector = $.Class("Vector", {
    x: 0,
    y:0
});

Vector.static({
    plus: function(a, b) {
        return new Vector({x: a.x + b.x, y: a.y + b.y});
    }
});

var a = new Vector({x:5, y:5});
var b = new Vector({x:5, y:5});

assert.equal(deep_equal(a, {x:5, y:5} ), true, "a ?");
assert.equal(deep_equal(b, {x:5, y:5} ), true, "b ?");
assert.equal(deep_equal(Vector.plus(a, b), {x:10, y:10} ), true, "plus is ok!");
assert.equal(deep_equal(a, {x:5, y:5} ), true, "a has changed");
assert.equal(deep_equal(b, {x:5, y:5} ), true, "b has changed");