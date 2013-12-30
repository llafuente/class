# node-class [![Build Status](https://secure.travis-ci.org/llafuente/class.png?branch=master)](http://travis-ci.org/llafuente/class) [![Coverage Status](https://coveralls.io/repos/llafuente/class/badge.png)](https://coveralls.io/r/llafuente/class)


## Introduction

If you were using Node-class v2, continue using it. The version 3 breaks everything, it will be easy to port. But It will take you some time.



## TODO list

* Hide / no enumerable properties
* final methods

## Class / Interfaces

Everything is best explained with a good test.


```js

	// "check_if" is a node-tap test

    var Character,
        Player,
        subzero,
        scorpion;

    // Create a Character class
    Character = __class("Character", {
        /// constructor
        initialize: function () {
        },
        //properties
        name: "",
        hp: 0,
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
        // if you are using a browser, consider using Extends, Implements (ucase)
        // explorer will complaint
        extends: ["Character"],
        /// constructor
        initialize: function () {
            this.__parent(); // <-- call up
        },
        //properties
        attacks: {fatality: 9000}, // yeah over 9 thousand!
        // implement attack method
        // be careful, node-class checks arguments count to be the same...
        attack: function (target, magic) {
            var damage = this.attacks[magic];
            target.hit(damage);
        }
    }, true/*autoset*/);

    subzero = new Player({
        name: "subzero", // this auto set your properties!
        hp: 10,
        // but if you are evil, we don't let you! it's not merge! it's set!
        donotexist: true
    });

    check_if.equal(subzero.name, "subzero", "name is subzero");
    check_if.equal(subzero.donotexist, undefined, "donotexist is undefined");

    scorpion = new Player({
        name: "scorpion", // this auto set your properties!
        hp: 10
    });

    // subzero attack scorpion
    subzero.attack(scorpion, "fatality");
    check_if.equal(scorpion.isDead(), true, "scorpion is dead");
    check_if.equal(subzero.isDead(), false, "subzero is alive");

    // properties usage, the node-class way of thinking
    var Storage = __class("Storage", {
        //properties
        boxes: {
            oranges: 100,
            apples: 100
        },
        unboxed: null
    }, true/* autoset */, true/* seal instances! */);


    // let's look instances behavior
    var st01 = new Storage({
        boxes: {
            peaches: 50
        },
        unboxed: {
            cherries: 120
        }
    });

    check_if.equal(st01.boxes.peaches, undefined,
    	"you cannot extend properties");
    check_if.equal(st01.unboxed.cherries, 120,
    	"but you can extend null properties with anything");

    st01.new_property = 1;
    check_if.equal(st01.new_property, undefined,
    	"and you cannot set new properties in 'execution' time, seal!");

    var st02 = new Storage({
        boxes: {
            oranges: {messing: "more"}
        }
    });

    check_if.equal(st02.boxes.oranges, "0[object Object]",
    	"node-class try to clone a number so 0 + What you send! stringified");
    // be very careful, there is no type check of what you send, just what it's expected.

    // typeof operator extends the functionality given by "object-enhancements" module.
    check_if.equal(__typeof(Storage), "class", "typeof class constructor");
    check_if.equal(__typeof(st02), "instance", "typeof instance");

```


## Dependencies

Function type is modified by: [function-enhacements](http://travis-ci.org/llafuente/js-function-enhacements)

Array type is modified by: [array-enhacements](http://travis-ci.org/llafuente/js-array-enhacements)

Object type is modified by: [object-enhacements](http://travis-ci.org/llafuente/js-object-enhacements)

You should take a look to those collections.


## Performance

In order to achieve a good performance, no overhead, node-class do things you should know about.

* You can call instances constructor (initialize method) outside.
* You can access sensible information that can destroy your own class, like YourClass.methods, YourClass.properties, etc... print YourClass in console to see the metadata node-class use to create.
* If you use more than 4 arguments in constructor or a derived function, apply will be used.

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
