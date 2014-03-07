# node-class [![Build Status](https://secure.travis-ci.org/llafuente/class.png?branch=master)](http://travis-ci.org/llafuente/class)

![NPM](https://nodei.co/npm/node-class.png?compact=true)

## Introduction

This is a classical object oriented but with the particular philosophy of Javascript. That means the usage of prototypes and defineProperty.

What you can expect:

* **extends** multiple classes (be careful with the order, it's important).
* **implements** an interface (so have interfaces).
* **final** (wip).
* **hidden**, alias to enumerable:false.
* **const**, alias to writable:false.
* some helper methods like:.
  * **serialize**
  * **unserialze**
  * **inspect** for proper inspecting in node, avoid "[Getter/Setter]"
  * **clone** (wip).

What you will not find, **ever**:

* *protected* or *private*, both require eval or the use of arguments.callee, that will hurt performance, and I'm very serious about top performance.
* *instanceof X*, the existence of interfaces and multiple inheritance disallow it use.


## TODO list

* final methods.
* examples for: accesors (getter/setters).
* examples for: static.
* examples for: Iterable.
* fix Eventize attached the same event name to a different classes.
* examples for: debug mode ON/OFF usage and consecuences in performance.

## Class / Interfaces

Everything is best explained with a good test.


```js

// note: "check_if" is a node-tap test
// this is part of test/test-class.js

var $ = require("../index.js"), // require("node-class")
    __class = $.class,

    Character,
    Player,
    goku,
    vegetta;

// Create a Character class
Character = __class("Character", {
    //properties
    name: "",
    hp: 0,
    /// constructor
    initialize: function () {
    },
    //methods
    hit: function (damage) {
        this.hp -= damage;
    },
    isDead: function () {
        return this.hp < 0;
    }
});

// now define an abstract method
// you could use "abstract method_name": function() {} instead
Character.abstract("attack", function (target, magic) {});


// if you try to create an instance, throws!
check_if.throws(function () {
    var x = new Character();
}, "throws because has an abstract method");

// now we create the NPC class

Player = __class("Player", {
    // if you are using a browser, consider using:
    // Extends & Implements (ucased) or quoted "extends"
    // IExplorer will complaint
    extends: ["Character"],

    /// constructor
    initialize: function () {
        this.__parent(); // <-- call up
    },

    //properties
    attacks: {kamehameha: 9000}, // yeah over 9 thousand!

    // implement attack method
    // this was abstract, argument count must be the same!
    attack: function (target, magic) {
        var damage = this.attacks[magic];
        target.hit(damage);
    }
}, true/*auto-set*/);

goku = new Player({
    name: "goku", // this auto set your properties!
    hp: 10,

    // but if you are evil, we don't let you!
    // remember: it's not merge! it's auto-set!
    donotexist: true
});

check_if.equal(goku.name, "goku", "name is goku");
check_if.equal(goku.donotexist, undefined, "donotexist is undefined");

vegetta = new Player({
    name: "vegetta",
    hp: 10
});

// goku attack vegetta
goku.attack(vegetta, "kamehameha");
check_if.equal(vegetta.isDead(), true, "vegetta is dead");
check_if.equal(goku.isDead(), false, "goku is alive!");

// inheritance
check_if.equal(__instanceof(vegetta, Player), true,
    "vegetta is instanceof Player");
check_if.equal(__instanceof(vegetta, Character), true,
    "vegetta is instanceof Character");

// if you prefer the you can send the string.
check_if.equal(__instanceof(vegetta, "Character"), true,
    "vegetta is instanceof Character as string");

```

Another example...

```js


// properties usage, the node-class "way of thinking"
var Storage = __class("Storage", {
    //properties
    boxes: {
        oranges: 100,
        apples: 100
    },
    unboxed: null,

    // this property is unmutable no-enumerable
    "hidden const secret": "x mark the treasure!"
}, true/* auto-set */, true/* seal instances! */);


// let's look instances behavior
var st01 = new Storage({
    boxes: {
        peaches: 50
    },
    unboxed: {
        cherries: 120
    }
});

// first we are going to check the hidden property is working
check_if.doesNotThrow(function() {
    var i;

    for (i in st01) {
        if (i === "secret") {
            throw new Error("secret is found!");
        }
    }

}, "secret found?");

// can we modify it ?
check_if.throws(function() {
    st01.secret = null;
}, "secret cannot be modified");

// now the rest of properties!
check_if.equal(st01.boxes.peaches, undefined,
    "you cannot extend properties remember!! auto-set!");
check_if.equal(st01.unboxed.cherries, 120,
    "but you can extend 'null' properties with anything...");

check_if.throws(function () {
    st01.new_property = 1;
}, "TypeError, object is not extensible!");

check_if.equal(st01.new_property, undefined,
    "and you cannot set new properties in 'execution' time, it's sealed!");

// a new example, and this is not a bug :)
var st02 = new Storage({
    boxes: {
        oranges: {messing: "more"}
    }
});

check_if.equal(st02.boxes.oranges, "0[object Object]",
    "node-class try to clone a number so 0 + (What you send)");
// this is the expected behavior, in fact is a performance trade of.
// node-class keep a recursive typeof of the property and expect you to send
// compatible data for cloning. Otherwise, use null
// classes are not cloned.

// typeof operator extends the functionality given by "object-enhancements" module.
check_if.equal(__typeof(Storage), "class", "typeof class constructor");
check_if.equal(__typeof(st02), "instance", "typeof instance");

```

## Configurator properties.

A configurator is a "property chain" that produce in the end an object.
Better with the following example/test

```js

var db = __$class("DB");

db.configurator("Number", {
    zerofill: false, // lowercased
    unsigned: false
});

t.deepEqual(
    // use the uppercased name to configure
    db.Number.UNSIGNED.ZEROFILL,
    // this is the result
    {zerofill: true, unsigned: true},
"test config");

t.deepEqual(db.Number.UNSIGNED, {zerofill: false, unsigned: true}, "test config");
t.deepEqual(db.Number.ZEROFILL, {zerofill: true, unsigned: false}, "test config");

```

Some configuration require more than booleans... in that case...

```js

db.configurator("String", {
    // same declaration
    length: 8
    // the third parameter force LENGTH to be a function
}, ["length"]);

t.deepEqual(db.String.LENGTH(100), {length: 100}, "test config");

```


Note, a configurator is static and it'll not be extended. It's supposed to be something like **const variable** in many languages with more power.

## Events (Event emitter)

Events is a flexible and powerful event emitter.

Extending Events & Properties integration.

```js

var Emitter = __class("EventEx", {
        extends: ["Events"],

        initialize: function(options) {
            // if you want onEventName to work, send options to Events
            // otherwise send nothing
            // but you must call it or throws
            this.__parent(options);
        }
    }),
    test_counter = 0,
    em;

function increment() {
    ++test_counter;
};

function decrement() {
    --test_counter;
    console.log("count-down decrement", test_counter);
};

em = new Emitter({
    onCountUp: increment,
    onCountDown: decrement,
    onGoDown: decrement
});

// note: CountUp was transformed to count-up
// if you prefer another notation, override Event.$transform with your own
// there are a few already defined like: Event.$transformIntact or Event.$transform_snake_case


check_if.equal(1, em.listeners("count-up").length, "test listeners: 1");
check_if.equal(1, em.listeners("count-down").length, "test listeners: 1");
check_if.equal(1, em.listeners("go-down").length, "test listeners: 1");

// fire the event! you have many alias to avoid collisions :)
em.trigger("count-up");
em.emit("count-up");
em.fireEvent("count-up");

check_if.equal(3, test_counter, "test_counter is 3");

// now decrement
em.emit("count-down");
check_if.equal(2, test_counter, "test_counter is 2");

// you can fire with asterisk will fire, go-down and count-down
em.emit("*-down");
check_if.equal(0, test_counter, "test_counter is 0");

// you can listen once to an event
check_if.throws(function() {
    em.once("count-down", decrement);
}, "throws it's normal, you can only attach once!");

em.once("count-down", function() {
    --test_counter;
    console.log("count-down anon", test_counter);
});

//or X times
em.on("count-up", function() {
    ++test_counter;
}, 2);
em.emit("count-down");
check_if.equal(-2, test_counter, "test_counter is -2");
em.emit("count-down");
check_if.equal(-3, test_counter, "test_counter is -3");

em.emit("count-up");
check_if.equal(-1, test_counter, "test_counter is -1");

em.emit("count-up");
check_if.equal(1, test_counter, "test_counter is 1");

em.emit("count-up");
check_if.equal(2, test_counter, "test_counter is 2");


check_if.throws(function() {
    em.emit("error", "wtf");
}, "throws because no error listener");

em.addListener("error", function() {});
check_if.doesNotThrow(function() {
    em.emit("error", "wtf");
}, "throws because no error listener");

```




## Dependencies

[function-enhacements](http://travis-ci.org/llafuente/js-function-enhacements)

[array-enhacements](http://travis-ci.org/llafuente/js-array-enhacements)

[object-enhacements](http://travis-ci.org/llafuente/js-object-enhacements)

*Developement*

[tap](https://github.com/isaacs/node-tap) (tests)

[ass](https://github.com/lloyd/ass) (code-coverage)



## Performance

In order to achieve a good performance, no overhead, node-class do things you should know about.

* You can call instances constructor (initialize method) outside (it's not a flaw in design avoid an apply call)
* You can access sensible information that can destroy your own class, like YourClass.methods, YourClass.properties, etc... print YourClass in console to see the metadata node-class use to create inheritance.
* If you use more than 4 arguments in constructor or a overridden function, apply will be used.
* Everything has debug enabled by default.

## Install

With [npm](http://npmjs.org) do:

```

npm install node-class

```

## test (travis-ci ready!)


```

npm test
// or
cd /test
node test-class.js

```

## license


MIT.
