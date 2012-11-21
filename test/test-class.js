var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//debug
$.log_level = 0;

//Vector class
var Vector = $.Class("Vector2", {
    x: 0,
    y: 0,
    __i: false
});

Vector.hide(["__i"]);

//Dog class
var Dog = $.Class("Dog", {
    animal: true,
    __bite_power: 10
});

Dog.implements({
    bite: function(where) {
        return "Dog bites!";
    },
    speak: function() {
        return "bark";
    },
    toString: function() {
        return "I'm a Dog";
    }
});

var Kitty = $.Class("Kitty", {
    __bite_power: 5
});

Kitty.extends(Dog, false); //false means do not override properties!

Kitty.implements({
    bite: function() {
        return "Kitty bites!";
    },
    speak: function() { // use of parent
        return "cant " + this.parent() + ", I meow";
    }
});


//abstract
var Animal = $.Class("Animal", {
    animal: true,
    __bite_power: null
});

Animal.abstract({
    "bite": function() {}
});


//extend abstract class
var Whale = $.Class("Whale", {
    __bite_power: /*it's over*/ 9000 /*!!!!!!!*/
});

Whale.extends(Animal, false);


var Mole = $.Class("Mole", {
    __bite_power: -1
});

Mole.extends(Animal, false);

Mole.implements({
    bite: function() {
        return "you can see a mole when bite you!";
    }
});

//
// -------------------------------------
// -------------------------------------
//


test("properties test", function(t) {

    var v = new Vector({x:10, y:10, __i: true}),
        v2 = new Vector({x:15, y:15, __i: 15});

    t.equal(v.x, 10, "v.x == 10");
    t.equal(v.y, 10, "v.y == 10");
    t.equal(v.__i, true, "v.__i == true");

    t.equal(v2.x, 15, "v2.x == 15");
    t.equal(v2.y, 15, "v2.y == 15");
    t.equal(v2.__i, 15, "v2.__i == 15");

    t.end();
});


test("extend test", function(t) {
    var d = new Dog();
    var k = new Kitty();

    t.equal(d.bite(), "Dog bites!", "Dog bites!");
    t.equal("" + d, "I'm a Dog", "I'm a Dog");

    t.equal(k.bite(), "Kitty bites!", "Kitty bite error: " + k.bite());
    t.equal(k.speak(), "cant bark, I meow", "Kitty speak error: " + k.speak());

    t.end();
});


test("abstract test init", function(t) {
    try {
        new Animal(); // throws -> because its abstract!
        throw "Impossible its abstract cannot be instanced!";
    } catch(e) {
        t.notEqual(e.message.indexOf("missing method"), -1, "assertion " + e.message);

    }
    t.end();
});


test("abstract test init extend", function(t) {

    try {
        new Whale(); // throws -> because its abstract!
        throw Error("Impossible not implementted bite!");
    } catch(e) {
        t.notEqual(e.message.indexOf("missing method"), -1, "assertion " + e.message);
    }

    //implement bite!
    Whale.implements({
        bite: function(where) {
            return "kill me!";
        }
    });

    t.end();
});





test("abstract instance", function(t) {

    var w = new Whale(); // ok now :)

    t.equal(w.bite(), "kill me!");

    t.end();
});



test("aliasing methods", function(t) {
    Whale.alias("bite", "destroy");

    var w = new Whale(); // ok now :)

    t.equal(w.destroy(), "kill me!");

    t.end();
});

test("aliasing not found method", function(t) {

    try {
        Whale.alias("not_found", "not_found");
        throw new Error("dont fail ?");
    } catch(e) {
        t.notEqual(e.message.indexOf("not found"), -1, "assertion " + e.message);
    }

    t.end();
});

test("serialization", function(t) {
    var d = new Dog();
    var k = new Kitty();
    var w = new Whale(); // ok now :)

    t.deepEqual(
        d.serialize(), //serialize without private vars
        { animal: true } // expected!
    );

    t.deepEqual(
        k.serialize(), //serialize without private vars
        { animal: true } // expected!
    );

    t.deepEqual(
        w.serialize(), //serialize without private vars
        { animal: true } // expected!
    );

    t.deepEqual(
        d.serialize(true), //serialize without private vars
        { animal: true, __bite_power: 10} // expected!
    );

    t.deepEqual(
        k.serialize(true), //serialize without private vars
        { animal: true, __bite_power: 5 } // expected!
    );

    t.deepEqual(
        w.serialize(true), //serialize without private vars
        { animal: true, __bite_power: 9000 } // expected!
    );


    t.end();
});


test("typeof", function(t) {
    var d = new Dog();
    var k = new Kitty();
    var w = new Whale(); // ok now :)

    // typeof test
    t.equal($.typeof(new Date()), "date", "type of string fail");

    t.equal($.typeof("string"), "string", "type of string fail");
    t.equal($.typeof([]), "array", "type of array fail");
    t.equal($.typeof(new Array(1)), "array", "type of array fail");
    t.equal($.typeof(1), "number", "number 1 fail");
    t.equal($.typeof(1.0), "number", "number 1.0 fail");
    t.equal($.typeof(NaN), "null", "Nan fail");
    t.equal($.typeof(false), "boolean", "boolean fail");
    t.equal($.typeof(true), "boolean", "boolean fail");
    t.equal($.typeof(undefined), "null", "undefined fail");
    t.equal($.typeof(null), "null", "null fail");
    t.equal($.typeof({}), "object", "object fail");
    t.equal($.typeof(Infinity), "number", "object fail");
    t.equal($.typeof(/^a$/), "regexp", "object fail");

    (function() {
        t.equal($.typeof(arguments), "arguments", "undefined fail");
    }());

    (function() {
        t.equal($.typeof(arguments), "arguments", "undefined fail");
    }({x:1}));

    (function() {
        t.equal($.typeof(arguments), "arguments", "undefined fail");
    }(1, 1));

    t.equal($.typeof(d), "Dog", "class name fail");
    t.equal($.typeof(k), "Kitty", "class name fail");
    t.equal($.typeof(w), "Whale", "class name fail");

    t.end();
});


test("instanceof", function(t) {
    var d = new Dog();
    var k = new Kitty();
    var w = new Whale(); // ok now :)

    t.equal($.instanceof(d, "Dog"), true, "class name fail");
    t.equal($.instanceof(d, "Class"), true, "class name fail");

    t.equal($.instanceof(k, "Kitty"), true, "class name fail");
    t.equal($.instanceof(k, "Class"), true, "class name fail");

    t.equal($.instanceof(w, "Animal"), true, "class name fail");
    t.equal($.instanceof(w, "Class"), true, "class name fail");
    t.equal($.instanceof(w, "Whale"), true, "class name fail");

    t.equal($.instanceof(Dog, "Dog"), true, "class name fail");
    t.equal($.instanceof(Kitty, "Kitty"), true, "class name fail");
    t.equal($.instanceof(Whale, "Whale"), true, "class name fail");

    t.end();
});



test("hide properties", function(t) {
    var m = new Mole(),
        v = new Vector(),
        key;

    for(key in v) {
        t.notEqual(key, "__i", "Vector is not hidden");
    }

    t.end();
});


test("disable autoset", function(t) {
    var m = $.Class("disable_autoset", {
            prop : false
        }).disable_autoset(),
        m2 = new m({prop: true});

    t.equal(m2.prop, false, "disable_autoset obj.prop to default");

    t.end();
});