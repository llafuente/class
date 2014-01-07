(function () {
    var $ = require("../index.js"),
        __$class = $.$class,
        __$interface = $.$interface,
        __class = $.class,
        __abstract = $.abstract,
        __method = $.method,
        __property = $.property,
        __typeof = $.__typeof,

        __rtypeof = $.__rtypeof,
        __typed_clone = $.__typed_clone,
        tap = require("tap"),
        test = tap.test;


    test("__rtypeof & __typed_clone", function (t) {
        t.equal(__rtypeof(10), "number", "number");
        t.equal(__rtypeof("10"), "string", "string");
        var mix1 = {"hello" : "string"};
        t.deepEqual(__rtypeof(mix1), {__: "object", "hello": "string"}, "mix 1");
        t.deepEqual(__typed_clone(mix1, __rtypeof(mix1)), mix1, "clone mix1");

        var mix2 = {hello: "world", ar: [10, 20]};
        t.deepEqual(__rtypeof(mix2), {__: "object", hello : "string", ar: {__: "array", 0: "number", 1: "number"}}, "mix 1");
        t.deepEqual(__typed_clone(mix2, __rtypeof(mix2)), mix2, "clone mix2");

        t.end();
    });


    test("property test", function (t) {
        var Vector = __$class("TEST2/Vectorector"),
            vector,
            vector2,
            TestNullProperty,
            TestNull,
            testnull;

        __property(Vector, "x", 0);
        __property(Vector, "y", 0);

        __property(Vector, "r", {
            obj: {z: 100},
            ar: [50, 50]
        });

        vector = new Vector();
        vector2 = new Vector();

        t.equal(vector.x, 0, "x = 0");
        t.equal(vector.y, 0, "y = 0");

        // this is because it's a prototype :)
        __property(Vector, "z", 0);
        t.equal(vector.z, 0, "later property propagates z = 0");

        // set and do not propagate to other instances
        vector.x = 100;
        t.equal(vector.x, 100, "x = 100");
        t.equal(vector2.x, 0, "x = 100");

        vector.r.obj.z = 200;
        t.equal(vector.r.obj.z, 200, "vector.r.obj.z = 200");
        t.notEqual(vector2.r.obj.z, 200, "vector2.r.obj.z != 200");

        vector2.r.ar.push(50);

        t.equal(vector.r.ar.length, 2, "vector.r.ar.length=2");
        t.equal(vector2.r.ar.length, 3, "vector2.r.ar.length=3");

        console.log("??", vector.r);
        console.log("??", vector2.r);

        t.equal(__typeof(Vector), "class", "typeof class constructor");
        t.equal(__typeof(vector), "instance", "typeof instance");

        //support for custom/unkown properies values using null


        TestNull = __$class("TestNull");
        TestNull.property("obj", null);

        TestNullProperty = {cloneme: true};

        testnull = new TestNull({obj: TestNullProperty});
        t.deepEqual(testnull.obj, {cloneme: true}, "if the property is null, must clone whatever you send!");
        TestNullProperty.cloneme = false;
        t.deepEqual(testnull.obj.cloneme, true, "be sure it's clone");

        t.end();
    });


    test("constructor test", function (t) {
        var Initialize = __$class("Initialize", function () {
                this.ready = true;
            }),
            instance;

        __property(Initialize, "ready", false);

        instance = new Initialize();

        t.equal(Initialize.methods[0], "initialize", "initialize");
        t.equal(Initialize.properties[0], "ready", "first property");
        t.equal(Initialize.descriptors[0].type, "boolean", "first type is boolean");
        t.equal(Initialize.prototype.ready, false, "in proto is false");
        t.equal(instance.ready, true, "in the instance is true");

        t.end();
    });


    test("constructor parent test", function (t) {
        var Father = __class("Father", {
                initialize: function () {
                    this.type = this.type + "A";
                },
                getClass: function () {
                    return this.$class;
                },
                type: ""
            }),
            father_instance,
            Son = __class("Son", {
                extends: ["Father"],
                initialize: function () {
                    this.__parent();
                    this.type = this.type + "B";
                },
                getClass: function () {
                    return this.__parent() + "/" + this.$class;
                }
            }),
            son_instance;

        father_instance = new Father();
        son_instance = new Son();

        t.equal(Father.properties[0], "type", "first property of Father");
        t.equal(Father.descriptors[0].type, "string", "first type is string of Father");
        t.equal(Father.prototype.type, "", "in proto is empty Father");

        t.equal(Son.properties[0], "type", "first property Son");
        t.equal(Son.descriptors[0].type, "string", "first type is string Son");
        t.equal(Son.prototype.type, "", "in proto is empty Son");

        t.equal(father_instance.type, "A", "in the instance is A");
        t.equal(son_instance.type, "AB", "in the instance is AB");

        t.equal(father_instance.getClass(), "Father", "Father class is Father");
        t.equal(son_instance.getClass(), "Son/Son", "Son class is Son, even if you call the parent one!");

        t.equal(__typeof(father_instance), "instance", "typeof an instance is instance");
        t.equal(__typeof(Father), "class", "typeof an instance is instance");

        t.end();
    });


    test("autofill test", function (t) {
        var A = __$class("TEST5/A"),
            ai,
            bi,
            ci;

        __property(A, "object", {
            a: 1,
            b: 2
        });

        __property(A, "array", [0, 0]);
        __property(A, "string", "string");
        __property(A, "number", 10);

        ai = new A();
        bi = new A({object: {a: 50, b: 50}, array: [50, 50], string: "newstring", number: 50});


        t.deepEqual(ai.object, {a: 1, b: 2}, "value of object");
        t.deepEqual(ai.array, [0, 0], "value of array");
        t.equal(ai.string, "string", "value of string");
        t.equal(ai.number, 10, "value of string");

        t.deepEqual(bi.object, {a: 50, b: 50}, "value of object");
        t.deepEqual(bi.array, [50, 50], "value of array");
        t.equal(bi.string, "newstring", "value of string");
        t.equal(bi.number, 50, "value of string");

        // do not allow to add new things!
        // 666 people is evectorl!
        ci = new A({newprop: 666, array: [0, 0, 666], object: {"evectorl": 666}});
        t.equal(ci.newprop, undefined, "newprop is undefined");
        t.equal(ci.array[2], undefined, "array[2] is undefined");
        t.equal(ci.object.evectorl, undefined, "array[2] is undefined");

        t.end();
    });



    test("abstract / implement test", function (t) {

        var u = __$class("User"),
            UserMadness;

        t.equal(u.$class, "User", "$class");
        t.equal(u.prototype.$class, "User", "$class");

        __method(u, "hello", function () {
            console.log("say hello");
        });

        t.equal(u.methods.length, 1, "methods count");

        __abstract(u, "defineme", function (onearg) {});

        t.equal(u.abstracts.length, 1, "abstracts count");

        UserMadness = __$class("UserMaddnes", ["User"]);

        t.equal(UserMadness.methods.length, 1, "methods count");
        t.equal(UserMadness.abstracts.length, 1, "abstracts count");

        t.throws(function () {
            var x = new UserMadness();
        }, "throws because has abstract");

        __method(UserMadness, "hello", function () {
            console.log("say madness hello");
            this.__parent();
        });

        t.throws(function () {
            __method(UserMadness, "defineme", function () {
                console.log("say hello");
            });
        }, "throws because the method has different parameters");

        __method(UserMadness, "defineme", function (onearg) {
            console.log("say hello");
        });

        t.equal(UserMadness.abstracts.length, 0, "abstracts count");

        //process.exit();
        new UserMadness().hello();


        t.end();
    });




    test("config property", function (t) {
        var db = __$class("DB");

        db.config_property("INT", {
            zerofill: false,
            unsigned: false
        });

        t.deepEqual(db.INT.UNSIGNED.ZEROFILL, {zerofill: true, unsigned: true}, "test config");
        t.deepEqual(db.INT.UNSIGNED, {zerofill: false, unsigned: true}, "test config");
        t.deepEqual(db.INT.ZEROFILL, {zerofill: true, unsigned: false}, "test config");

        t.end();
    });



    test("test lazy class initialization", function (t) {
        var AA = __class("AA", {
                extends: [],
                implements: [],
                initialize: function () {
                },
                method1: function () {
                    return "method1";
                },
                property1: {
                    xx: true
                }
            }),
            aai,
            BB,
            bb,
            bbi;

        aai = new AA();

        t.deepEqual(aai.$class, "AA", "class name");
        t.deepEqual(aai.property1, {xx: true}, "property");
        t.deepEqual(typeof aai.method1, "function", "function");
        t.deepEqual(aai.method1(), "method1", "function call");



        BB = __class("BB", {
            extends: ["AA"],
            implements: [],
            initialize: function () {
            },
            method2: function () {
                return "method1";
            },
            property2: {
                xx: true
            }
        });

        bbi = new BB();

        t.deepEqual(bbi.$class, "BB", "class name");
        t.deepEqual(bbi.property1, {xx: true}, "property");
        t.deepEqual(typeof bbi.method1, "function", "function");
        t.deepEqual(bbi.method1(), "method1", "function call");

        t.deepEqual(bbi.property2, {xx: true}, "property");
        t.deepEqual(typeof bbi.method2, "function", "function");
        t.deepEqual(bbi.method2(), "method1", "function call");

        t.end();
    });


    test("exception when you mess up!", function (t) {
        var Interface = __$interface("Interface");
        console.log(Interface);
        __abstract(Interface, "x", function () {});

        t.throws(function () {
            var x = new Interface();
        }, "throws because it's an interface");

        var Implementation = __$class("Implementation", null, ["Interface"]);

        t.throws(function () {
            var x = new Implementation();
        }, "throws because has an abstract method");
        Implementation.method("x", function () {});

        t.doesNotThrow(function () {
            var x = new Implementation();
        }, "throws because has an abstract method");


        t.end();
    });


    test("home page example", function (check_if) {
        // note: "check_if" is a node-tap test
        // this is part of test/test-class.js

        var $ = require("../index.js"), // require("node-class")
            __class = $.class,

            Character,
            Player,
            subzero,
            scorpion;

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
            // parent
            // if you are using a browser, consider using Extends, Implements (ucase) explorer will complaint, or quote it.
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
            donotexist: true // but if you are evil, we don't let you! it's not merge! it's set!
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

        check_if.equal(st01.boxes.peaches, undefined, "you cannot extend properties");
        check_if.equal(st01.unboxed.cherries, 120, "but you can extend null properties with anything");

        st01.new_property = 1;
        check_if.equal(st01.new_property, undefined, "and you cannot set new properties in 'execution' time, seal!");

        var st02 = new Storage({
            boxes: {
                oranges: {messing: "more"}
            }
        });

        check_if.equal(st02.boxes.oranges, "0[object Object]", "node-class try to clone a number so 0 + What you send! stringified");
        // be very careful, there is no type check of what you send, just what it's expected.

        // typeof operator extends the functionality given by "object-enhancements" module.
        check_if.equal(__typeof(Storage), "class", "typeof class constructor");
        check_if.equal(__typeof(st02), "instance", "typeof instance");


        check_if.end();
    });
}());