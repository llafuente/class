node-class
==========

Class system for nodejs, require ES5. Provide a proper way yo deal with a basic class layer.
It force you to code in a clean way, a very clean way.
provide a proper typeof and instanceof.


Objective
=========
Provide a good way to deal with classes and messy code that is normally asociated with javascript.
But in the end, provide a very thin layer in production where all "check" code could be removed so no overhead!



HOWTO: Creation
========

``` js

var $ = require('class');
var Dog = new $.Class("Dog", {
    animal: true
});

Dog.implements({
    bite: function(where) {
        return "Dog bites!";
    }
});

var d = new Dog();

console.log(k.bite()); // Dog bites!

```

HOWTO: Extending
=========


``` js
// paste the code above!
var Kitty = new $.Class("Kitty", {
});

Kitty.extends(Dog);

Kitty.implements({
    bite: function() {
        console.log("Kitty bites!");
    }
});


var k = new Kitty();
var d = new Dog();

k.bite(); // Dog bites!
d.bite(); // Kitty bites!

```

HOWTO: Abstract Class
==============

``` js
var Animal = new $.Class("Animal", {
    animal: true
});

Animal.abstract(["bite"]);

new Animal(); // throws -> because its abstract!

var Dog = new $.Class("Dog", {
});

Dog.extends(Animal);

new Dog(); // throws -> because you dont implement "bite"

Dog.implements({
    bite: function(where) {
        console.log("Dog bites!");
    }
});

new Dog(); // ok now :)

```

HOWTO: Finale methods
==============

``` js
var Animal = new $.Class("Animal", {
    animal: true
});

Animal.finale({
    bite: function() {
        console.log("animal bites!");
    }
);

var a = new Animal();
a.bite(); // animal bites!

var Dog = new $.Class("Dog", {
});

Dog.extends(Animal);

Dog.implements({
    bite: function(where) {
        console.log("Dog bites!");
    }
}); // throws! -> finale functions cannot be implemented again!

```

HOWTO: instanceof & typeof
===================

``` js
// using the "Finale methods" classes
var a = new Animal();
$.instanceOf(a, "Animal") -> true

var d = new Dog();
$.instanceOf(d, "Dog") -> true
$.instanceOf(d, "Animal") -> true


$.typeOf([]) -> array
$.typeOf({}) -> object
$.typeOf(1) -> number
$.typeOf(NaN) -> null
$.typeOf(null) -> null
$.typeOf(undefined) -> null
$.typeOf(argumments) -> arguments

$.typeOf(a) -> Animal
$.typeOf(b) -> Dog


```

HOWTO: serialization & properties init
===============================

``` js

var Vector = new $.Class("Vector", {
    x: 0,
    y: 0
});

var v = new Vector({x: 10, y:10});
console.log(v.serialize()); // {x: 10, y:10}

```

install
=======

With [npm](http://npmjs.org) do:

```
npm install class
```

test
====

The test is custom made :)

```

cd /test
node test.js

```

license
=======

MIT.
