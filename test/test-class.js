var $ = require("../index.js"),
    __$class = $.$class,
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
    var V = __$class("TEST2/Vector"),
        vi,
        vi2;

    __property(V, "x", 0);
    __property(V, "y", 0);

    __property(V, "r", {
        obj: {z: 100},
        ar: [50, 50]
    });

    vi = new V();
    vi2 = new V();

    t.equal(vi.x, 0, "x=0");
    t.equal(vi.y, 0, "y=0");

    // this is because it's a prototype :)
    __property(V, "z", 0);
    t.equal(vi.z, 0, "later property propagates z=0");

    // set and do not propagate to other instances
    vi.x = 100;
    t.equal(vi.x, 100, "x=100");
    t.equal(vi2.x, 0, "x=100");

    vi.r.obj.z = 200;
    t.equal(vi.r.obj.z, 200, "vi.r.obj.z=200");
    t.notEqual(vi2.r.obj.z, 200, "vi2.r.obj.z!=200");

    vi2.r.ar.push(50);

    t.equal(vi.r.ar.length, 2, "vi.r.ar.length=2");
    t.equal(vi2.r.ar.length, 3, "vi2.r.ar.length=3");

    console.log("??", vi.r);
    console.log("??", vi2.r);

    t.equal(__typeof(V), "function", "typeof constructor");
    t.equal(__typeof(vi), "class", "typeof instance");


    t.end();
});


test("constructor test", function (t) {
    var a = __$class("TEST3/A", function () {
            this.inited = true;
        }),
        ai;

    __property(a, "inited", false);

    ai = new a();

    t.equal(a.methods[0], "initialize", "initialize");
    t.equal(a.properties[0], "inited", "first property");
    t.equal(a.descriptors[0].type, "boolean", "first type is boolean");
    t.equal(a.prototype.inited, false, "in proto is false");
    t.equal(ai.inited, true, "in the instance is true");

    t.end();
});


test("constructor parent test", function (t) {
    var A = __$class("TEST4/A", function () {
            this.type = this.type + "A";
        }),
        ai,
        B,
        bi;

    __property(A, "type", "");

    B = __$class("TEST4/B", ["TEST4/A"], function () {
        console.log(this);
        this.__parent();
        this.type = this.type + "B";
    });

    ai = new A();
    bi = new B();

    t.equal(A.properties[0], "type", "first property A");
    t.equal(A.descriptors[0].type, "string", "first type is string A");
    t.equal(A.prototype.type, "", "in proto is empty A");

    t.equal(B.properties[0], "type", "first property B");
    t.equal(B.descriptors[0].type, "string", "first type is string B");
    t.equal(B.prototype.type, "", "in proto is empty B");

    t.equal(ai.type, "A", "in the instance is A");
    t.equal(bi.type, "AB", "in the instance is AB");

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
    // 666 people is evil!
    ci = new A({newprop: 666, array: [0, 0, 666], object: {"evil": 666}});
    t.equal(ci.newprop, undefined, "newprop is undefined");
    t.equal(ci.array[2], undefined, "array[2] is undefined");
    t.equal(ci.object.evil, undefined, "array[2] is undefined");

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
        new UserMadness();
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
            initialize: function() {
            },
            method1: function() {
                return "method1";
            },
            property1: {
                xx: true
            }
        }),
        aai,
        bb,
        bbi;

    aai = new AA();

    t.deepEqual(aai.$class, "AA", "class name");
    t.deepEqual(aai.property1, {xx:true}, "property");
    t.deepEqual(typeof aai.method1, "function", "function");
    t.deepEqual(aai.method1(), "method1", "function call");



    BB = __class("BB", {
        extends: ["AA"],
        implements: [],
        initialize: function() {
        },
        method2: function() {
            return "method1";
        },
        property2: {
            xx: true
        }
    });

    bbi = new BB();

    t.deepEqual(bbi.$class, "BB", "class name");
    t.deepEqual(bbi.property1, {xx:true}, "property");
    t.deepEqual(typeof bbi.method1, "function", "function");
    t.deepEqual(bbi.method1(), "method1", "function call");

    t.deepEqual(bbi.property2, {xx:true}, "property");
    t.deepEqual(typeof bbi.method2, "function", "function");
    t.deepEqual(bbi.method2(), "method1", "function call");

    t.end();
});