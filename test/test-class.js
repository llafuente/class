var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//debug
$.log_level = 0;

//Vector class
var Vector = new $.Class("Vector2", {
    x: 0,
    y: 0,
    __i: false
});



Vector.hide(["__i"]);


//Dog class
var Dog = new $.Class("Dog", {
    animal: true,
    __bite_power: 10
});

Dog.Implements({
    bite: function() {
        return "Dog bites!";
    },
    speak: function() {
        return "bark";
    },
    toString: function() {
        return "I'm a Dog";
    }
});

var Kitty = new $.Class("Kitty", {
    __bite_power: 5
});

Kitty.Extends(Dog, false); //false means do not override properties!

Kitty.Implements({
    bite: function() {
        return "Kitty bites!";
    },
    speak: function() { // use of parent
        return "cant " + this.parent() + ", I meow";
    }
});

//abstract
var Animal = new $.Class("Animal", {
    animal: true,
    __bite_power: null
});

Animal.Abstract({
    bite: function() {},
    powerup: function(item) {}
});


//extend abstract class
var Whale = new $.Class("Whale", {
    __bite_power: /*it's over*/ 9000 /*!!!!!!!*/
});

Whale.Extends(Animal, false);

var Mole = new $.Class("Mole", {
    __bite_power: -1
});

Mole.Extends(Animal, false);

Mole.Implements({
    bite: function() {
        return "you can see a mole when bite you!";
    },
    powerup: function(item) {
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
        throw Error("Impossible its abstract cannot be instanced!");
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
    Whale.Implements({
        bite: function() {
            return "kill me!";
        }
    });

    t.end();
});


test("abstract test argument count NOK", function(t) {


    try {
        Whale.Implements({
            powerup: function() {}
        });

        throw Error("Impossible cannot implement powerup with no arguments!");
    } catch(e) {
        t.notEqual(e.message.indexOf("parameter count"), -1, "assertion " + e.message);
    }

    t.end();
});


test("abstract test argument count OK", function(t) {

    try {

        Whale.Implements({
            powerup: function(item) { return item; }
        });

        throw Error("no problem");
    } catch(e) {
        t.notEqual(e.message.indexOf("no problem"), -1, "assertion " + e.message);
    }

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
    ,"Dog");

    t.deepEqual(
        k.serialize(), //serialize without private vars
        { animal: true } // expected!
    ,"Kitty");

    t.deepEqual(
        w.serialize(), //serialize without private vars
        { animal: true } // expected!
    ,"Whale");

    t.deepEqual(
        d.serialize(true), //serialize without private vars
        { animal: true, __bite_power: 10} // expected!
    ,"Dog internal");

    t.deepEqual(
        k.serialize(true), //serialize without private vars
        { animal: true, __bite_power: 5 } // expected!
    ,"Kitty internal");

    t.deepEqual(
        w.serialize(true), //serialize without private vars
        { animal: true, __bite_power: 9000 } // expected!
    ,"Whale internal");


    t.end();
});


test("typeof", function(t) {
    var d = new Dog();
    var k = new Kitty();
    var w = new Whale(); // ok now :)

    // typeof test
    t.equal($.Typeof(new Date()), "date", "type of string fail");

    t.equal($.Typeof("string"), "string", "type of string fail");
    t.equal($.Typeof([]), "array", "type of array fail");
    t.equal($.Typeof(new Array(1)), "array", "type of array fail");
    t.equal($.Typeof(1), "number", "number 1 fail");
    t.equal($.Typeof(1.0), "number", "number 1.0 fail");
    t.equal($.Typeof(NaN), "null", "Nan fail");
    t.equal($.Typeof(false), "boolean", "boolean fail");
    t.equal($.Typeof(true), "boolean", "boolean fail");
    t.equal($.Typeof(undefined), "null", "undefined fail");
    t.equal($.Typeof(null), "null", "null fail");
    t.equal($.Typeof({}), "object", "object fail");
    t.equal($.Typeof(Infinity), "number", "object fail");
    t.equal($.Typeof(/^a$/), "regexp", "object fail");

    (function() {
        t.equal($.Typeof(arguments), "arguments", "undefined fail");
    }());

    (function() {
        t.equal($.Typeof(arguments), "arguments", "undefined fail");
    }({x:1}));

    (function() {
        t.equal($.Typeof(arguments), "arguments", "undefined fail");
    }(1, 1));

    t.equal($.Typeof(d), "Dog", "class name fail");
    t.equal($.Typeof(k), "Kitty", "class name fail");
    t.equal($.Typeof(w), "Whale", "class name fail");

    t.end();
});


test("instanceof", function(t) {
    var d = new Dog();
    var k = new Kitty();
    var w = new Whale(); // ok now :)

    t.equal($.Instanceof(d, "Dog"), true, "class name fail");
    t.equal($.Instanceof(d, "Class"), true, "class name fail");

    t.equal($.Instanceof(k, "Kitty"), true, "class name fail");
    t.equal($.Instanceof(k, "Class"), true, "class name fail");

    t.equal($.Instanceof(w, "Animal"), true, "class name fail");
    t.equal($.Instanceof(w, "Class"), true, "class name fail");
    t.equal($.Instanceof(w, "Whale"), true, "class name fail");

    t.equal($.Instanceof(Dog, "Dog"), true, "class name fail");
    t.equal($.Instanceof(Kitty, "Kitty"), true, "class name fail");
    t.equal($.Instanceof(Whale, "Whale"), true, "class name fail");

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
    var m = new $.Class("disable_autoset", {
            prop : false
        }).disable_autoset(),
        m2 = new m({prop: true});

    t.equal(m2.prop, false, "disable_autoset obj.prop to default");

    t.end();
});