var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

test("listen single event", function(t) {
    var evm = new $.EventMachine();
    evm.on("single-event", "sevent", function(combo_name) {

        t.equal(combo_name, "single-event", "check event type");
        t.end();
    });

    evm.enable("sevent");
});
test("listen two events", function(t) {
    var evm = new $.EventMachine();
    evm.on("two-events", "event-A + event-B", function(combo_name) {

        t.equal(combo_name, "two-events", "check event type");
        t.end();
    });

    evm.enable("event-A");
    evm.enable("event-B");
});
test("listen two events one negate", function(t) {
    var evm = new $.EventMachine();
    evm.on("two-events", "event-A + !event-B", function(combo_name) {

        t.equal(combo_name, "two-events", "check event type");
        t.end();
    });

    evm.enable("event-A");
});


test("listen two events one negate 2", function(t) {
    var evm = new $.EventMachine();
    var step = 0;
    evm.on("two-events", "event-A + !event-B", function(combo_name) {
        t.equal(step, 3, "check when it's fired");
        t.equal(combo_name, "two-events", "check event type");
        t.end();
    });

    ++step;
    evm.enable("event-B");
    ++step;
    evm.enable("event-A");
    ++step;
    evm.disable("event-B");
});


test("listen many events", function(t) {
    var evm = new $.EventMachine();
    var step = 0;
    evm.on("two-events", "left, down, right, up", function(combo_name) {
        t.equal(step, 4, "check when it's fired");
        t.equal(combo_name, "two-events", "check event type");
        t.end();
    });

    ++step;
    evm.trigger("left");
    ++step;
    evm.trigger("down");
    ++step;
    evm.trigger("right");
    ++step;
    evm.trigger("up");
});


test("listen many events fail combo and ok", function(t) {
    var evm = new $.EventMachine();
    var step = 0;
    evm.on("two-events", "left, down, right, up", function(combo_name) {
        t.equal(step, 8, "check when it's fired");
        t.equal(combo_name, "two-events", "check event type");
        t.end();
    });

    ++step;
    evm.trigger("left");
    ++step;
    evm.trigger("down");
    ++step;
    evm.trigger("right");
    ++step;
    evm.trigger("right");

    ++step;
    evm.trigger("left");
    ++step;
    evm.trigger("down");
    ++step;
    evm.trigger("right");
    ++step;
    evm.trigger("up");
});


test("combo for triggers no enable/disable", function(t) {
    var evm = new $.EventMachine();
    var step = 0;
    evm.on("two-events", "left, down + !left, right + !left + !down, up + !right + !down + !left", function(combo_name) {
        t.equal(step, 9, "check when it's fired");
        t.equal(combo_name, "two-events", "check event type");
        t.end();
    });

    ++step;
    evm.enable("left");
    ++step;
    evm.enable("down");
    ++step;
    evm.enable("right");
    ++step;
    evm.enable("up");

    ++step;
    evm.disable("left");
    evm.disable("down");
    evm.disable("right");
    evm.disable("up");

    ++step;
    evm.trigger("left");
    ++step;
    evm.trigger("down");
    ++step;
    evm.trigger("right");
    ++step;
    evm.trigger("up");
});