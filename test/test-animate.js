var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

var Vector = $.Class("Vector", {
    x: 0,
    y: 0
});

Vector.extends($.Animate, true, true);

Vector.setAnimationProterties("x", {
    mask: "@",
    type: "number"
});

Vector.setAnimationProterties("y", {
    mask: "@",
    type: "number"
});

test("animation.integer", function(t) {
    console.log(Vector);
    var v = new Vector();

    v.once("animation:start", function() {
        t.equal(v.x, 10);
    });

    v.once("animation:end", function() {
        console.log("first animation end!");

        t.equal(v.x, 100);

        v.animate({
            property: "x",
            transition: $.Animate.Transitions.linear,
            time: 5000,
            fps: 1,
            queue: true
        }, 200);

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

                t.end();
            });
        });

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


