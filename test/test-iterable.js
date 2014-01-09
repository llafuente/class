(function () {
    "use strict";
    require('ass');

    var $ = require("../index.js"),
        tap = require("tap"),
        test = tap.test;

    //setup

    test("static test", function (t) {
        var Itr = new $.Iterable();

        Itr.set("xxx", "yyy");

        t.deepEqual(Itr.get("xxx"), "yyy", "xxx is yyy");

        Itr.forEach(function (value, key) {
            t.deepEqual(value, "yyy", "value is yyy");
            t.deepEqual(key, "xxx", "key is xxx");
        });

        Itr.rem("xxx");
        t.deepEqual(Itr.get("xxx"), null, "xxx is null");

        Itr.set("up", "up");
        Itr.set("down", "down");
        Itr.set("left", "left");
        Itr.set("right", "right");

        t.deepEqual(Itr.current(), {key: "up", value: "up"}, "first");
        t.deepEqual(Itr.next(), {key: "down", value: "down"}, "second");
        t.deepEqual(Itr.next(), {key: "left", value: "left"}, "thrid");
        t.deepEqual(Itr.next(), {key: "right", value: "right"}, "fourth");
        t.deepEqual(Itr.next(), null, "next is null");
        t.deepEqual(Itr.eof(), true, "EOF true");
        t.deepEqual(Itr.prev(), {key: "right", value: "right"}, "prev is third");
        t.deepEqual(Itr.eof(), false, "EOF false");
        t.deepEqual(Itr.prev(), {key: "left", value: "left"}, "prev is third");
        Itr.reset();
        t.deepEqual(Itr.current(), {key: "up", value: "up"}, "current is up");

        Itr.erase("up");

        t.deepEqual(Itr.current(), {key: "down", value: "down"}, "current is down");

        Itr.end();
        t.deepEqual(Itr.current(), {key: "right", value: "right"}, "current is right");
        t.deepEqual(Itr.eof(), false, "EOF false");
        Itr.erase("right");

        t.deepEqual(Itr.current(), {key: "left", value: "left"}, "current is left");
        t.deepEqual(Itr.eof(), false, "EOF false");

        t.end();
    });

    test("static test", function (t) {
        var Itr = new $.Iterable(),
            keys = [],
            values = [];

        Itr.set("0", 0);
        Itr.set("1", 2);
        Itr.set("3", 4);
        Itr.set("2", 6);

        Itr.forEach(function(v, k) {
            values.push(v);
            keys.push(k);
        });

        t.deepEqual(keys, [0,1,3,2], "check keys");
        t.deepEqual(values, [0,2,4,6], "check values");

        t.deepEqual(true, Itr.some(function(v, k) {return v === 2;}), "some values are 2");
        t.deepEqual(false, Itr.some(function(v, k) {return v === 99;}), "some values are 99");

        t.deepEqual(true, Itr.some(function(v, k) {return k === "2";}), "some keys are 2");
        t.deepEqual(false, Itr.some(function(v, k) {return k === "99";}), "some keys are 99");

        t.deepEqual(true, Itr.every(function(v, k) {return v < 7;}), "every less than 7");
        t.deepEqual(false, Itr.every(function(v, k) {return v > 0;}), "every greater than 0");

        t.deepEqual([0,2], Itr.filter(function(v, k) {return v < 3;}), "every less than 7");

        t.deepEqual({key: "1", value: 2}, Itr.firstOf(function(v, k) {return v === 2;}), "first 2");


        t.end();
    });

}());