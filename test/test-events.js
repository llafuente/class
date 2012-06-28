var $ = require("../index.js");
var assert = require("assert");

// nom install deep_equal @substack
var deep_equal = require("deep-equal");

//debug
$.log_level = 0;

//
// events - basic flow control
//
function test_event(event) {
    var counter = 0;

    var sample_ev0 = $.Eventize(function() {
        console.log("sample_ev0");
        ++counter;

        if(counter == 1) {
            this.delay(500, this);
            this.remove();
        }
    });

    var sample_ev1 = $.Eventize(function() {
        console.log("sample_ev1");
        ++counter;

        assert.equal(counter, 2, "[" + event + "]sample_ev1 error [" + counter + "] ");
    });

    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sample_ev2 = function() {
        console.log("sample_ev2");
        ++counter;

        assert.equal(counter, 3, "[" + event + "]sample_ev2 error [" + counter + "] ");
    }
    var once = 0;
    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sample_once_ev3 = function() {
        console.log("sample_ev3");
        assert.equal(++once, 1, "[" + event + "]sample_once_ev3 error [" + once + "] ");
    }


    var emitter = new $.Events();

    console.log(emitter, emitter.has_listener("go"));

    assert.equal(emitter.has_listener("go"), false, "[" + event + "] should be at false listeners");

    emitter.on("go", sample_ev0);
    assert.equal(emitter.has_listener("go"), 1, "[" + event + "] should be at 1 listeners");

    emitter.on("go", sample_ev1);
    assert.equal(emitter.has_listener("go"), 2, "[" + event + "] should be at 2 listeners");

    emitter.on("go", sample_ev2);
    assert.equal(emitter.has_listener("go"), 3, "[" + event + "] should be at 3 listeners");

    emitter.once("go", sample_once_ev3);
    assert.equal(emitter.has_listener("go"), 4, "[" + event + "] should be at 4 listeners");

    console.log(emitter);

    emitter.emit(event);

    assert.equal(counter, 3, "[" + event + "]after emit error [" + counter + "] ");

    setTimeout(function() {
        assert.equal(counter, 4, "[" + event + "]after 1000ms error [" + counter + "] ");

        assert.equal(emitter.has_listener("go"), 2, "[" + event + "] should be at 2 listeners");
        emitter.off("go", sample_ev1);
        assert.equal(emitter.has_listener("go"), 1, "[" + event + "] should be at 1 listeners");
        emitter.off("go", sample_ev2);
        assert.equal(emitter.has_listener("go"), false, "[" + event + "] should be at 0 listeners");

        emitter.emit(event); //should no emit new events!
    }, 1000);
};

test_event("go");
//patterns!
test_event("g*");