(function () {
    "use strict";

    var $ = require("../index.js"),
        tap = require("tap"),
        test = tap.test,
        Itr = new $.Iterable();

    //setup

    test("static test", function (t) {

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
        t.deepEqual(Itr.current(), {key: "up", value: "up"});

        t.end();
    });

}());