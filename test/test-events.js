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

test("on_unhandled_event", function(t) {
    var emitter = new $.Events(),
        count_unhandled = 0,
        count_test = 0;
    emitter.on_unhandled_event(function() {
        ++count_unhandled;
    });

    emitter.emit("test");

    emitter.on("test", function() {
        ++count_test;
    });

    emitter.emit("test");

    t.equal(count_unhandled, 1, "unhandled called one time");
    t.equal(count_test, 1, "test called one time");

    t.end();
});


test("pipe_events", function(t) {
    var emitter = new $.Events(),
        emitter2 = new $.Events(),
        count_unhandled = 0,
        count_test = 0,
        count_unhandled2 = 0;

    emitter.pipe_events(emitter2);

    emitter.on_unhandled_event(function() {
        ++count_unhandled;
    });
    emitter2.on_unhandled_event(function() {
        ++count_unhandled2;
    });

    emitter.emit("test");

    emitter.on("test", function() {
        ++count_test;
    });

    emitter.emit("test");

    t.equal(count_unhandled, 1, "unhandled called one time");
    t.equal(count_test, 1, "test called one time");
    t.equal(count_unhandled2, 2, "unhandled2 called two times");

    t.end();
});


test("error events throw", function(t) {
    var emitter = new $.Events(),
        count = 0;

    try {
        emitter.emit("error", "wtf!");
        t.equal(true, false, "Events throw, is ok");
    } catch(e) {
        t.equal(true, true, "Events throw, is ok");
    }


    emitter.on_unhandled_event(function() {
        ++count;
    });


    emitter.emit("error", "wtf!");

    t.equal(count, 1, "on_unhandled_event capture errors");

    t.end();
});
