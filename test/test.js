var $ = require("../lib/class.js");

// nom install deep_equal @substack
var deep_equal = require("deep-equal");

//debug
$.log_level = 0;


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
    }
});

var d = new Dog();

if( "Dog bites!" != d.bite()) {
    throw "Dog didnt byte! " + d.bite();
}

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
    }
});


var k = new Kitty();

if( "Kitty bites!" != k.bite()) {
    throw "Kitty didnt byte properly! " + k.bite();
}

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

if( "kill me!" != w.bite()) {
    throw "Whale didnt byte properly! " + w.bite();
}

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
    if(e.message.ondexOf("not found") === -1) {
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


//
// events - basic flow control
//
(function() {
    var counter = 0;

    var sample_ev0 = $.Eventize(function() {
        ++counter;

        if(counter == 1) {
            this.delay(500, this);
            this.remove();
        }
    });

    var sample_ev1 = $.Eventize(function() {
        ++counter;

        if (counter != 2) {
            throw "event fail!";
        }
    });

    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sample_ev2 = function() {
        ++counter;

        if (counter != 3) {
            throw "third!" + counter;
        }
    }
    var once = 0;
    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sample_once_ev3 = function() {
        if(++once !== 1) {
            throw "not jsut once!";
        }
    }


    var emitter = new $.Events();

    emitter.on("go", sample_ev0);
    emitter.on("go", sample_ev1);
    emitter.on("go", sample_ev2);
    emitter.once("go", sample_once_ev3);

    emitter.emit("go");

    if (counter != 3) {
        throw "counter should be 3! one per event!";
    }

    setTimeout(function() {
        if (counter != 4) {
            throw "event fail!";
        }

        if(!emitter.is_listened("go")) {
            throw "should be at 2 listeners";
        }
        emitter.off("go", sample_ev1);
        if(!emitter.is_listened("go")) {
            throw "should be at 1 listeners";
        }
        emitter.off("go", sample_ev2);
        if(emitter.is_listened("go")) {
            throw "should be at 0 listeners";
        }

        emitter.emit("go");
    }, 1000);



}());







// now you should see all
$.log_level = 5;
while (--$.log_level) {
    $.error("error");
    $.warn("warn");
    $.info("info");
    $.debug("debug");
    $.verbose("verbose");
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