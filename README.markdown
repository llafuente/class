node-class
==========

Class system for nodejs (ES5 required, could work on new browsers).
Provide a proper clean wait to deal with spagetti code that usually polute Javascript.
Also provide a proper typeof and instanceof.


Objective
=========
Force coders to code in a clean way, dont allow messy code if possible...
Developement version that throws and test many things but provide a production code that dont do that so no overhead!


HOWTO: Creation
========

``` js

var $ = require('class');

var Dog = new $.Class("Dog", {
    animal: true,
    __bite_power: 10
});

Dog.implements({
    bite: function(where) {
        return "Dog bites!";
    }
});

var d = new Dog();

console.log(k.bite()); // console: Dog bites!

```

HOWTO: Extending
=========


``` js
// continue from above...
var Kitty = new $.Class("Kitty", {
    __bite_power: 5
});

Kitty.extends(Dog, false); //false means do not override properties!

Kitty.implements({
    bite: function() {
        return "Kitty bites!";
    }
});

var k = new Kitty();

k.bite(); // console: Dog bites!
d.bite(); // console: Kitty bites!

```

HOWTO: Abstract Class
==============

``` js

var Animal = new $.Class("Animal", {
    animal: true,
    __bite_power: null
});

Animal.abstract(["bite"]);

//you could try this... buts...
try {
    new Animal(); // throws -> because its abstract!
} catch(e) {
}

var Whale = new $.Class("Whale", {
    __bite_power: /*it's over*/ 9000 /*!!!!!!!*/
});

Whale.extends(Animal, false); // 2nd arguments false means, do not override_options

//you could try this... buts...
try {
    new Whale(); // throws -> because bite is not implemented
} catch(e) {
}

Whale.implements({
    bite: function(where) {
        return "kill me!";
    }
});

var w = new Whale(); // ok now :)

console.log(w.bite()); // console: kill me!

```


HOWTO: Aliasing
==============

``` js

Whale.alias("destroy", "bite");
console.log(w.destroy()); // console: kill me!

```

HOWTO: Finale methods
==============

``` js

// imagine you have this before the extends
Animal.final({
    die: function() {
        return "an animal died";
    }
});

// you should extend allways when the class is finished
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
$.typeOf(undefined) -> null // maybe changed!
$.typeOf(true) -> boolean
$.typeOf(false) -> boolean
$.typeOf(argumments) -> arguments

$.typeOf(a) -> Animal
$.typeOf(b) -> Dog


```

HOWTO: serialization & properties init
===============================

``` js

var Vector = new $.Class("Vector", {
    x: 0,
    y: 0,
    __private: true
});

var v = new Vector({x: 10, y:10});
console.log(v.serialize()); // {x: 10, y:10}
console.log(v.serialize(true)); // {x: 10, y:10, __private: true}

```


More HOWTO soon.
================

check: extends_js.js it has some sugar without touching prototypes (except Function)


Install
=======

With [npm](http://npmjs.org) do:

```

npm install class

```

test
====

The test is custom made :)

```

npm test
// or
cd /test
node test.js

```

license
=======

MIT.
