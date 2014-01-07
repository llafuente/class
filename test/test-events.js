var $ = require("../index.js"),
    __class = $.class,
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

    function anon() {
        ++counter;

        if(counter == 1) {
            anon.delay(500, this);
            anon.remove();
        }
    }

    var sample_ev0 = $.Eventize(anon);

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

    t.equal(emitter.hasListeners("go"), false, "[" + event + "] should be at false listeners");

    emitter.on("go", sample_ev0);
    t.equal(emitter.hasListeners("go"), 1, "[" + event + "] should be at 1 listeners");

    emitter.on("go", sample_ev1);
    t.equal(emitter.hasListeners("go"), 2, "[" + event + "] should be at 2 listeners");

    emitter.on("go", sample_ev2);
    t.equal(emitter.hasListeners("go"), 3, "[" + event + "] should be at 3 listeners");

    emitter.once("go", sample_once_ev3);
    t.equal(emitter.hasListeners("go"), 4, "[" + event + "] should be at 4 listeners");

    emitter.fireEvent(event);

    t.equal(counter, 3, "[" + event + "]after emit error [" + counter + "] ");

    setTimeout(function() {
        t.equal(counter, 4, "[" + event + "]after 1000ms error [" + counter + "] ");

        t.equal(emitter.hasListeners("go"), 2, "[" + event + "] should be at 2 listeners");
        emitter.off("go", sample_ev1);
        t.equal(emitter.hasListeners("go"), 1, "[" + event + "] should be at 1 listeners");
        emitter.off("go", sample_ev2);
        t.equal(emitter.hasListeners("go"), false, "[" + event + "] should be at 0 listeners");

        emitter.fireEvent(event); //should no emit new events!

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

    emitter.fireEvent("test");

    emitter.on("test", function() {
        ++count_test;
    });

    emitter.fireEvent("test");

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

    emitter.fireEvent("test");

    emitter.on("test", function() {
        ++count_test;
    });

    emitter.fireEvent("test");

    t.equal(count_unhandled, 1, "unhandled called one time");
    t.equal(count_test, 1, "test called one time");
    t.equal(count_unhandled2, 2, "unhandled2 called two times");

    t.end();
});


test("error events throw", function(t) {
    var emitter = new $.Events(),
        count = 0;

    try {
        emitter.fireEvent("error", "wtf!");
        t.equal(true, false, "Events throw, is ok");
    } catch(e) {
        t.equal(true, true, "Events throw, is ok");
    }


    emitter.on_unhandled_event(function() {
        ++count;
    });


    emitter.fireEvent("error", "wtf!");

    t.equal(count, 1, "on_unhandled_event capture errors");

    t.end();
});


test("home page example, extending Events", function(check_if) {
    var Emitter = __class("EventEx", {
            implements: ["Events"],
            initialize: function(options) {
                // if you want onEvent to work, send options to Events
                // otherwise send nothing
                // but you must call it!!
                this.__parent(options);
            }
        }),
        test_counter = 0,
        em;

    em = new Emitter({
        onCountUp: function() {
            ++test_counter;
        },
        onCountDown: function() {
            --test_counter;
        },
        onGoDown: function() {
            --test_counter;
        }
    });
    // note CountUp was transform to count-up
    // if you prefer another notation, override Event.$transform with your own
    // there are a few already defined like: Event.$transformIntact or Event.$transform_snake_case
    check_if.equal(1, em.listeners("count-up").length, "test listeners: 1");
    check_if.equal(1, em.listeners("count-down").length, "test listeners: 1");
    check_if.equal(1, em.listeners("go-down").length, "test listeners: 1");

    // fire the event! you have many alias :)
    em.trigger("count-up");
    em.emit("count-up");
    em.fireEvent("count-up");

    check_if.equal(3, test_counter, "test_counter is 3");

    // now decrement
    em.emit("count-down");
    check_if.equal(2, test_counter, "test_counter is 2");

    // you can fire with asterisk will fire, go-down and count-down
    em.emit("*-down");
    check_if.equal(0, test_counter, "test_counter is 2");

    check_if.end();
});

test("error events throw", function(t) {
    var emitter = new $.Events({
            onTest: function() {},
            onlowtest: function() {}
        });

    t.equal(1, emitter.listeners("test").length, "test listeners: 1");
    t.equal(0, emitter.listeners("lowtest").length, "lowtest listeners: 0");

    t.end();
});
