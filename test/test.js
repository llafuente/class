var $ = require("../lib/class.js");
var assert = require("assert");

// nom install deep_equal @substack
var deep_equal = require("deep-equal");

//debug
$.log_level = 0;

var Vector = new $.Class("Vector2", {
    x: 0,
    y: 0,
    __i: false
});

Vector.hide(["__i"]);

var v = new Vector({x:10, y:10, __i: true});

assert.equal(v.x, 10,     "constructor error x="   + v.x  );
assert.equal(v.y, 10,     "constructor error y="   + v.y  );
assert.equal(v.__i, true, "constructor error __i=" + v.__i);

var v2 = new Vector({x:15, y:15, __i: 15});

assert.equal(v.x, 10,     "constructor error x="   + v.x  );
assert.equal(v.y, 10,     "constructor error y="   + v.y  );
assert.equal(v.__i, true, "constructor error __i=" + v.__i);

assert.equal(v2.x, 15,     "constructor error x="   + v.x  );
assert.equal(v2.y, 15,     "constructor error y="   + v.y  );
assert.equal(v2.__i, 15,   "constructor error __i=" + v.__i);

//-------------------
// Class new & implements
//-------------------

/*

var cls = new $.Class(<String:class_name>, <object:properties>);
cls.implements(<Object:{key:function}>);
cls.extends(<Class>); //could be an instanced class!
cls.abstract(<Array[String]>); //list of method names
cls.options(<Object>); //list of method names

*/

var Dog = new $.Class("Dog", {
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

Dog.hide(["toString"]);

var d = new Dog();

assert.equal(d.bite(), "Dog bites!", "Dog bite error: " + d.bite());
assert.equal("" + d, "I'm a Dog", "Dog toString error: " + d);

//--------
// extends
//--------
var Kitty = new $.Class("Kitty", {
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


var k = new Kitty();

assert.equal(k.bite(), "Kitty bites!", "Kitty bite error: " + k.bite());
assert.equal(k.speak(), "cant bark, I meow", "Kitty speak error: " + k.speak());

//---------
// abstract
//---------

var Animal = new $.Class("Animal", {
    animal: true,
    __bite_power: null
});

Animal.abstract(["bite"]);

try {
    new Animal(); // throws -> because its abstract!
    throw "Impossible its abstract cannot be instanced!";
} catch(e) {
    if(e.message.indexOf("missing method") === -1) {
        console.log(e.message);
        throw "what error did i get ?";
    }
}

var Whale = new $.Class("Whale", {
    __bite_power: /*it's over*/ 9000 /*!!!!!!!*/
});

Whale.extends(Animal, false);

try {
    new Whale(); // throws -> because its abstract!
    throw "Impossible not implementted bite!";
} catch(e) {
    if(e.message.indexOf("missing method") === -1) {
        console.log(e.message);
        throw "what error did i get ?";
    }
}

Whale.implements({
    bite: function(where) {
        return "kill me!";
    }
});

var w = new Whale(); // ok now :)

assert.equal(w.bite(), "kill me!", "Whale bite error: " + w.bite());

//--------
//aliasing
//--------

Whale.alias("destroy", "bite");

if( "kill me!" != w.destroy()) {
    throw "Whale didnt byte properly! " + w.bite();
}

try {
    Whale.alias("destroy", "bite");
} catch(e) {
    if(e.message.indexOf("not found") === -1) {
        throw "what error ?¿?!";
    }
}

//-------------
//serialization
//-------------

if (!deep_equal(d.serialize(), //serialize without private vars
    { animal: true } // expected!
    )) {
    console.log(d.serialize(true));
    throw "Dog serialization error";
}
if (!deep_equal(k.serialize(), //serialize without private vars
    { animal: true }  // expected!
    )) {
    console.log(k.serialize(true));
    throw "Kitty serialization error";
}
if (!deep_equal(w.serialize(), //serialize without private vars
    { animal: true }  // expected!
    )) {
    console.log(w.serialize(true));
    throw "Whale serialization error";
}

if (!deep_equal(d.serialize(true), //serialize with private vars
    { animal: true, __bite_power: 10}  // expected!
    )) {
    console.log(d.serialize(true));
    throw "Dog serialization error";
}
if (!deep_equal(k.serialize(true), //serialize with private vars
    { animal: true, __bite_power: 5 }  // expected!
    )) {
    console.log(k.serialize(true));
    throw "Kitty serialization error";
}
if (!deep_equal(w.serialize(true), //serialize with private vars
    { animal: true, __bite_power: 9000 }  // expected!
    )) {
    console.log(w.serialize(true));
    throw "Whale serialization error";
}





// typeof test
assert.equal($.typeof(new Date()), "date", "type of string fail");

assert.equal($.typeof("string"), "string", "type of string fail");
assert.equal($.typeof([]), "array", "type of array fail");
assert.equal($.typeof(new Array(1)), "array", "type of array fail");
assert.equal($.typeof(1), "number", "number 1 fail");
assert.equal($.typeof(1.0), "number", "number 1.0 fail");
assert.equal($.typeof(NaN), "null", "Nan fail");
assert.equal($.typeof(false), "boolean", "boolean fail");
assert.equal($.typeof(undefined), "null", "undefined fail");
assert.equal($.typeof(null), "null", "null fail");
assert.equal($.typeof(true), "boolean", "boolean fail");
assert.equal($.typeof({}), "object", "object fail");
(function() {
assert.equal($.typeof(arguments), "arguments", "undefined fail");
}());

(function() {
assert.equal($.typeof(arguments), "arguments", "undefined fail");
}({x:1}));

(function() {
assert.equal($.typeof(arguments), "arguments", "undefined fail");
}(1, 1));

assert.equal($.typeof(d), "Dog", "class name fail");
assert.equal($.typeof(k), "Kitty", "class name fail");
assert.equal($.typeof(w), "Whale", "class name fail");


assert.equal($.instanceof(d, "Dog"), true, "class name fail");
assert.equal($.instanceof(d, "Class"), true, "class name fail");

assert.equal($.instanceof(k, "Kitty"), true, "class name fail");
assert.equal($.instanceof(k, "Class"), true, "class name fail");

assert.equal($.instanceof(w, "Animal"), true, "class name fail");
assert.equal($.instanceof(w, "Class"), true, "class name fail");
assert.equal($.instanceof(w, "Whale"), true, "class name fail");

assert.equal($.instanceof(Dog, "Dog"), true, "class name fail");
assert.equal($.instanceof(Kitty, "Kitty"), true, "class name fail");
assert.equal($.instanceof(Whale, "Whale"), true, "class name fail");



// now you should see all
$.log_level = 5;
while (--$.log_level) {
    $.error("error");
    $.warn("warn");
    $.info("info");
    $.debug("debug");
    $.verbose("verbose");
}



var Mole = new $.Class("Mole", {
    __bite_power: -1
});

Mole.implements({
    bite: function() {
        return "you can see a mole when bite you!";
    }
});

Mole.hide(["bite"]);
var m = new Mole();
var key;


for(key in Mole.prototype) {
    if(key == "bite") {
        throw new Error("bite is found!");
    }
}

for(key in m) {
    if(key == "bite") {
        throw new Error("bite is found!");
    }
}



/*

    //Object.merge test
    var a = {x:1};
    var b = {y:1, x:2};
    var c = Object.merge(a, b);

    console.log(a,b,c);


    //Object.merge test
    a = {x:1, deep: {f:1}};
    b = {y:1, x:2};
    c = Object.merge(a, b, false, true);

    console.log(a,b,c);

*/