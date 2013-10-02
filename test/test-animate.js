var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var Vector = new $.Class("Vector", {
        x: 0,
        y: 0,
        style: "left: 0px; top: 0px;"
    }),
    cfg;

Vector.Extends($.Animate, true, true);

cfg = Vector.setAnimationProterties("x", {
    mask: "@d",
    type: "number"
});

cfg = Vector.setAnimationProterties("y", {
    mask: "@d",
    type: "number"
});

cfg = Vector.setAnimationProterties("style", {
    mask: "left: @dpx; top: @dpx;",
    type: "number"
});

test("x animation integer 1", function(t) {
    var v = new Vector();

    v.once("animation:start", function() {
        t.equal(v.x, 10);
    });

    v.once("animation:end", function() {
        t.equal(v.x, 100);
        t.end();
    });

    //run!
    v.animate({
        property: "x",
        transition: $.Animate.Transitions.linear,
        time: 5000,
        fps: 1,
        queue: true
    }, [10, 100]);
});


test("x animation integer 2", function(t) {
    var v = new Vector();

    v.once("animation:start", function() {
        t.equal(v.x, 0);
    });

    v.once("animation:end", function() {
        t.equal(v.x, 200);
        t.end();
    });

    //run!
    v.animate({
        property: "x",
        transition: $.Animate.Transitions.linear,
        time: 5000,
        fps: 1,
        queue: true
    }, 200);
});

test("x animation integer 3", function(t) {
    var v = new Vector();

    v.once("animation:start", function() {
        t.equal(v.x, 100);
    });

    v.once("animation:end", function() {
        t.equal(v.x, 500);
        t.end();
    });

    //run!
    v.animate({
        property: "x",
        transition: $.Animate.Transitions.linear,
        time: 5000,
        fps: 1,
        queue: true
    }, {from: 100, to: 500});
});


test("x,y animation integer 1", function(t) {
    var v = new Vector();

    v.once("animation:start", function() {
        t.equal(v.x, 0);
        t.equal(v.y, 0);
    });

    v.once("animation:end", function() {
        t.equal(v.x, 100);
        t.equal(v.y, 100);
        t.end();
    });

    //run!
    v.animate({
        property: "x",
        transition: $.Animate.Transitions.linear,
        time: 5000,
        fps: 1,
        queue: true
    }, {
        "50%": {
            x: -50,
            y: -50
        },
        "100%": {
            x:100,
            y:100
        }
    });
});


test("style animation masked", function(t) {
    var v = new Vector();

    v.once("animation:start", function() {
        t.equal(v.style, "left: 0px; top: 0px;");
    });

    v.once("animation:end", function() {
        t.equal(v.style, "left: 100px; top: 150px;");
        t.end();
    });

    //run!
    v.animate({
        transition: $.Animate.Transitions.linear,
        time: 5000,
        fps: 1,
        queue: true
    }, {
        "100%": {
            style: "left: 100px; top: 150px;"
        }
    });
});









/*

        v.animate({
            property: "x",
            transition: $.Animate.Transitions.linear,
            time: 5000,
            fps: 1,
            queue: true
        }, );

        v.once("animation:end", function() {
            t.equal(v.x, 200);

            v.animate({
                property: "x",
                transition: $.Animate.Transitions.linear,
                time: 5000,
                fps: 1,
                queue: true
            }, {
                "0%" : 150,
                "50%" : 50,
                "100%" : 150
            });

            v.once("animation:end", function() {
                t.equal(v.x, 150);


            });
        });

    });

*/