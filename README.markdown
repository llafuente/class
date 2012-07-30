# node-class [![Build Status](https://secure.travis-ci.org/llafuente/class.png?branch=master)](http://travis-ci.org/llafuente/class)
==========

Class system for nodejs (ES5 ready)
Object oriented class system for javascript based on prototypes.
Provide everything you could want from Classes except private/protected with almost no performance hit.
Also provide a proper typeof and instanceof.

Has some debug code that you can remove in production to gain extra performance


## Objective
============

Force coders to code in a clean way, dont allow messy code if possible...
In developement the class will throw and do many sanity checks. You could remove the debug code in production to gain a bit extra performance.


## The Class constructor
========================

``` js

var $ = require('class');

var Dog = $.Class("Dog", { // note: you could use new, but it's not required...
    animal: true,
    __bite_power: 10
});

// set some functions
Dog.implements({
    bite: function(where) {
        return "Dog bites!";
    },
    speak: function() {
        return "bark";
    },
});

// note: you can call implements as many times as you need.
Dog.implements({
    toString: function() {
        return "I'm a Dog";
    }
});

// but use new here, because sound more error resilient
var d = new Dog();

console.log(k.bite()); // console: Dog bites!
console.log("" + k); // console: I'm a Dog

```

## Extending Classes
====================

``` js
// image that continue from above...

var Kitty = $.Class("Kitty", {
    __bite_power: 5
});

Kitty.extends(Dog, false); // 2nd argument = false, means do not override properties, so __bite_power will be 5

Kitty.implements({
    bite: function() {
        return "Kitty bites!";
    },
    speak: function() {
        // use of parent to call a function that "father" has
        return "I cant " + this.parent() + ", I meow";
    }
});

var k = new Kitty();

console.log(k.bite()); // console: Dog bites!
console.log(d.bite()); // console: Kitty bites!
console.log(k.speak()); // console: "I cant bark, I meow"

```

## Abstract Class methods
=========================

``` js

var Animal = $.Class("Animal", {
    animal: true,
    __bite_power: null
});

Animal.abstract(["bite"]);

//you could try this... but...
try {
    new Animal(); // throws -> because its abstract!
} catch(e) {
    console.log(e); // check the error
}

var Whale = $.Class("Whale", {
    __bite_power: /*it's over*/ 9000 /*!!!!!!!*/
});

Whale.extends(Animal, false); // again remember the 2nd arguments...

//you could try this... but...
try {
    new Whale(); // throws -> because bite is not implemented
} catch(e) {
    console.log(e); // check the error
}

Whale.implements({
    bite: function(where) {
        return "kill me!";
    }
});

var w = new Whale(); // ok now :)

console.log(w.bite()); // console: kill me!

```


## Method aliasing
==================

``` js

Whale.alias("destroy", "bite");
console.log(w.destroy()); // console: kill me!

```

## Finale methods
=================

``` js

// imagine you have this before the extends
Animal.final({
    die: function() {
        return "an animal died";
    }
});

// you should extend always when the class is finished
Whale.extends(Animal, false);

try {
    Whale.implements({
        die: function() {
            return "dont mind the text, it throws!";
        }
    });
} catch() {
}

```

## instanceof & typeof
======================

``` js
// instanceof on Class
console.log($.instanceof(Dog, "Dog"));  // console: "true"
console.log($.instanceof(Kitty, "Kitty"));  // console: "true"
console.log($.instanceof(Whale, "Whale"));  // console: "true"

// instanceof on Class instances
console.log($.instanceof(d, "Dog"));    // console: "true"
console.log($.instanceof(d, "Class"));  // console: "true"
console.log($.instanceof(k, "Kitty"));  // console: "true"
console.log($.instanceof(k, "Class"));  // console: "true"
console.log($.instanceof(w, "Whale"));  // console: "true"
console.log($.instanceof(w, "Animal")); // console: "true"
console.log($.instanceof(w, "Class"));  // console: "true"

// typeof on Class instances
console.log($.typeof(d))          // console: "Dog"
console.log($.typeof(k))          // console: "Kitty"
console.log($.typeof(w))          // console: "Whale"

// typeof on js types
console.log($.typeof("string"))    // console: "string"
console.log($.typeof([]))          // console: "array"
console.log($.typeof(new Array(1)) // console: "array"
console.log($.typeof(1))           // console: "number"
console.log($.typeof(1.0))         // console: "number"
console.log($.typeof(NaN))         // console: "null"
console.log($.typeof(null))        // console: "null"
console.log($.typeof(undefined))   // console: "null", maybe change...
console.log($.typeof(true))        // console: "boolean"
console.log($.typeof(false))       // console: "boolean"
console.log($.typeof({}))          // console: "object"
console.log($.typeof(new Date()))  // console: "date"

(function() {
console.log($.typeof(arguments)) // console: "arguments"
}());

```

## Hide methods (no enumerable)
===============================

@Note! All methods that Class put in the final object, like serialize/deserialize are hidden.

``` js

var Mole = $.Class("Mole", {
    __bite_power: -1
});

Mole.implements({
    bite: function() {
        return "you can see a mole when bite you!";
    }
});

Mole.hide(["bite"]);

var m = new Mole();

// This way you can hide all methods an have a clean console.log without .serialize()
// I know you are lazy
console.log(m); // console: { __bite_power: -1 }

// also hided from the "Class"
console.log(Mole);


// @tip: hide all methods ?
// Mole.hide( Mole.get_methods() )

```

## HOWTO: serialization & properties init
=========================================

``` js

var Vector = $.Class("Vector", {
    x: 0,
    y: 0,
    __private: true
});

var v = new Vector({x: 10, y:10});
console.log(v.serialize()); // {x: 10, y:10}
console.log(v.serialize(true)); // {x: 10, y:10, __private: true}

```

## Sugar list
=============

``` js

Object.each // for in
Object.merge // merge two objects, modify the first argument!!!
Object.merge_cloning //merge and clone
Function.prototype.pass // use the given args for every call
Function.prototype.args // prepend given arguments
Function.prototype.delay // delay the execution x ms
Function.prototype.periodical // execute every x ms
Function.prototype.debounce // execute once every x ms regardless the call count
Function.prototype.throttle // limit the execution time, one time every x ms
Function.prototype.once // execute once
String.sprintf //same as c
String.vsprintf //same as c
Array.ize // create an array given any arg
Array.append //append ar2 to ar, return a cloned one
Array.clone //clone an array
Array.insertAt // insert in given position
RegExp.escape // escape the string so it can be used inside a regex as literal

```
## Sugar examples: Functions
============================

``` js

var test = function() {
    console.log(arguments);
    console.log(this);
}

// Function.args: prepend given arguments

var t2 = test.args(["say", "hello"], {iamthis: true});

t2();
// { '0': 'say', '1': 'hello' }
// { iamthis: true }

t2("thidparam!");
// { '0': 'say', '1': 'hello', '2': 'thidparam!' }
// { iamthis: true }


// Function.pass: create a function with given args and any call you will have the same arguments

var t3 = test.pass(["dont mind your args"], {whoami: "root"});

t3();
// { '0': 'dont mind your args' }
// { whoami: 'root' }
t3("second - is not displayed!");
// { '0': 'dont mind your args' }
// { whoami: 'root' }


// Function.delay execute the funtion in X miliseconds

var del = t2.delay(500);
setTimeout(del);

// Function.periodical execute the funtion every X miliseconds

var inter = t2.periodical(500);
clearInterval(inter);

// Function.throttle execute a function once every X miliseconds, dont mind how many time you call it.

var t4 = test.throttle(1000);
var inter = t4.periodical(50);


```

## Classes: Events
==================

``` js
var ev_manager = new $.Events(),
    fn = function() { console.log("fired"); };
ev_manager.on("ev", fn);
ev_manager.emit("ev"); // console.log: fired
// wildcard support!
ev_manager.emit("e*"); // console.log: fired
// remove
ev_manager.off("ev", fn);
console.log(ev_manager.has_listener("ev", fn)); // console.log: false

```

## Classes: Animate & EventMachine
==================================

See the webexamples :)


## Install
==========

With [npm](http://npmjs.org) do:

```

npm install node-class

```

## test (travis-ci ready!)
==========================

```

npm test
// or
cd /test
node test.js

```

## license
==========

MIT.
