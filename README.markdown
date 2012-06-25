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
    },
    speak: function() {
        return "bark";
    },
    toString: function() {
        return "I'm a Dog";
    }
});

var d = new Dog();

console.log(k.bite()); // console: Dog bites!
console.log("" + k); // console: I'm a Dog

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
    },
    speak: function() { // use of parent
        return "cant " + this.parent() + ", I meow";
    }
});

var k = new Kitty();

console.log(k.bite()); // console: Dog bites!
console.log(d.bite()); // console: Kitty bites!
console.log(k.speak()); // console: "cant bark, I meow"

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

HOWTO: Hide methods (no enumerable)
==================================================

@Note! All methods that Class put in the final object, like serialize/deserialize are hidden.

``` js

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

// This way you can hide all methods an have a clean console.log without .serialize()
// I know you are lazy
console.log(m); // console: { __bite_power: -1 }

// also hided from the "Class"
console.log(Mole);


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

Sugar: Functions
================

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

================

More HOWTO soon.
================

check: extends_js.js it has some sugar without touching prototypes (except Function)


Install
=======

With [npm](http://npmjs.org) do:

```

npm install node-class

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
