var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;
//setup

//debug
$.log_level = 0;

//
// events - basic flow control
//


function test_event(event, t) {
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

        t.equal(counter, 2, "[" + event + "]sample_ev1 error [" + counter + "] ");
    });

    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sample_ev2 = function() {
        ++counter;

        t.equal(counter, 3, "[" + event + "]sample_ev2 error [" + counter + "] ");
    }
    var once = 0;
    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sample_once_ev3 = function() {
        t.equal(++once, 1, "[" + event + "]sample_once_ev3 error [" + once + "] ");
    }


    var emitter = new $.Events();

    t.equal(emitter.has_listener("go"), false, "[" + event + "] should be at false listeners");

    emitter.on("go", sample_ev0);
    t.equal(emitter.has_listener("go"), 1, "[" + event + "] should be at 1 listeners");

    emitter.on("go", sample_ev1);
    t.equal(emitter.has_listener("go"), 2, "[" + event + "] should be at 2 listeners");

    emitter.on("go", sample_ev2);
    t.equal(emitter.has_listener("go"), 3, "[" + event + "] should be at 3 listeners");

    emitter.once("go", sample_once_ev3);
    t.equal(emitter.has_listener("go"), 4, "[" + event + "] should be at 4 listeners");

    emitter.emit(event);

    t.equal(counter, 3, "[" + event + "]after emit error [" + counter + "] ");

    setTimeout(function() {
        t.equal(counter, 4, "[" + event + "]after 1000ms error [" + counter + "] ");

        t.equal(emitter.has_listener("go"), 2, "[" + event + "] should be at 2 listeners");
        emitter.off("go", sample_ev1);
        t.equal(emitter.has_listener("go"), 1, "[" + event + "] should be at 1 listeners");
        emitter.off("go", sample_ev2);
        t.equal(emitter.has_listener("go"), false, "[" + event + "] should be at 0 listeners");

        emitter.emit(event); //should no emit new events!

        t.end();
    }, 1000);
};


test("test event go", function(t) {
    test_event("go", t);
});
test("test event g*", function(t) {
    test_event("g*", t);
});


