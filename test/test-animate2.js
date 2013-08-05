var $ = require("../index.js"),
    Animate = $.Animate,
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var Vector = $.Class("Vector", {
        x: 0,
        y: 0,
        style: "left: 0px; top: 0px;"
    }),
    cfg;

Vector.Extends(Animate, true, true);

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

test("x animation chain", function(t) {
    var v = new Vector(),
        chained = false;

    v.setAnimationLink(Animate.CHAIN);
    v.once("animation:start", function() {
        t.equal(v.x, 0);
        v.once("animation:start", function() {
            t.equal(v.x, 500);
        });
    });

    v.once("animation:end", function() {
        t.equal(v.x, 100);
        v.once("animation:end", function() {
            t.equal(v.x, 600);
            t.equal(chained, true, "animation was queued");
            t.end();
        });
    });

    v.on("animation:chain", function() {
        chained = true;
    });

    v.on("animation:update", function() {
        //console.log(v.x);
    });

    //run!
    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [0, 100]);

    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [500, 600]);
});


test("x animation chain", function(t) {
    var v = new Vector(),
        chained = false;

    v.setAnimationLink(Animate.CHAIN);
    v.once("animation:start", function() {
        t.equal(v.x, 0);
        v.once("animation:start", function() {
            t.equal(v.x, 500);
            v.once("animation:start", function() {
                t.equal(v.x, 700);
            });
        });
    });

    v.once("animation:end", function() {
        t.equal(v.x, 100);
        v.once("animation:end", function() {
            t.equal(v.x, 600);
            v.once("animation:end", function() {
                t.equal(v.x, 800);
                t.equal(chained, true, "animation was queued");
                t.end();
            });
        });
    });

    v.on("animation:chain", function() {
        chained = true;
    });

    v.on("animation:update", function() {
        //console.log(v.x);
    });

    //run!
    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [0, 100]);

    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [500, 600]);

    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [700, 800]);
});


test("x animation stop", function(t) {
    var v = new Vector(),
        chained = false;

    v.setAnimationLink(Animate.STOP);

    //run!
    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [0, 100]);

    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [500, 600]);

    t.equal(v.isAnimated(), false, "animation must be stopped");
    t.end();

});


test("x animation chain", function(t) {
    var v = new Vector(),
        chained = false;

    v.setAnimationLink(Animate.IGNORE);
    v.once("animation:start", function() {
        t.equal(v.x, 0);
    });

    v.once("animation:end", function() {
        setTimeout(function() {
            t.equal(v.x, 100);
            t.end();
        }, 1000);
    });

    v.on("animation:chain", function() {
        chained = true;
    });

    v.on("animation:update", function() {
        //console.log(v.x);
    });

    //run!
    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [0, 100]);

    v.animate({
        property: "x",
        transition: Animate.Transitions.linear,
        time: 5000,
        fps: 1,
    }, [500, 600]);
});