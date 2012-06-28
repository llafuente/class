var $ = require("../lib/class.js");
var assert = require("assert");

// nom install deep_equal @substack
var deep_equal = require("deep-equal");

//debug
$.log_level = 0;

//
// events - basic flow control
//
function test_seq(event) {
    var counter = 0;
    var ev_counter = 0;
    var works = 0;

    var sequence_1 = function(work) {
        setTimeout(function() {
            console.log("sequence_1");
            ++counter;
            assert.equal(counter, 1, "sequence_1 error [" + counter + "] ");
            work.done();
        }, 500);
    };

    var sequence_2 = function(work) {
        setTimeout(function() {
            console.log("sequence_2");
            ++counter;
            assert.equal(counter, 2, "sequence_2 error [" + counter + "] ");
            work.done();
        }, 500);
    };

    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sequence_3 = function(work) {
        setTimeout(function() {
            console.log("sequence_3");
            ++counter;
            assert.equal(counter, 3, "sequence_3 error [" + counter + "] ");
            work.done("i send you this!");
        }, 500);
    }
    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sequence_4 = function(work, message) {
        console.log(message);
        setTimeout(function() {
            console.log("sequence_4");
            ++counter;
            assert.equal(counter, 4, "sequence_4 error [" + counter + "] ");
            work.done();
        }, 500);
    }


    var sq = new $.Sequence();
    sq.on("work:new", function() {
        ++works;
    });
    sq.on("work:done", function() {
        assert.equal(counter, ++ev_counter, "sequence_4 error [" + counter + "] ");
    });

    sq.on("empty", function() {
        console.log("the end");
        assert.equal(counter, ev_counter, "done count vs counter");
        assert.equal(counter, works, "works count vs counter");
    });


    sq.push(sequence_1, true);
    sq.push(sequence_2, true);
    //as array
    sq.push([sequence_3, sequence_4], true);



    sq.fire();
};

test_seq("go");
