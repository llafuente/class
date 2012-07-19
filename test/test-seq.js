var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//setup

//debug
$.log_level = 0;

//
// events - basic flow control
//
test("sequence test", function(t){

    var counter = 0;
    var ev_counter = 0;
    var works = 0;

    var sequence_1 = function(work) {
        setTimeout(function() {
            ++counter;
            t.equal(counter, 1, "sequence_1 error [" + counter + "] ");
            work.done();
        }, 500);
    };

    var sequence_2 = function(work) {
        setTimeout(function() {
            ++counter;
            t.equal(counter, 2, "sequence_2 error [" + counter + "] ");
            work.done();
        }, 500);
    };

    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sequence_3 = function(work) {
        setTimeout(function() {
            ++counter;
            t.equal(counter, 3, "sequence_3 error [" + counter + "] ");
            work.done("i send you this!");
        }, 500);
    }
    // you can use normal functions if you dont want to stop/remove the listener from itself
    var sequence_4 = function(work, message) {
        setTimeout(function() {
            ++counter;
            t.equal(counter, 4, "sequence_4 error [" + counter + "] ");
            work.done();
        }, 500);
    }


    var sq = new $.Sequence();
    sq.on("work:new", function() {
        ++works;
    });
    sq.on("work:done", function() {
        t.equal(counter, ++ev_counter, "workd done [" + counter + "] ");
    });

    sq.on("empty", function() {
        t.equal(counter, ev_counter, "done count vs counter");
        t.equal(counter, works, "works count vs counter");

        //end the test after 500ms empty!
        setTimeout(function() {
            t.end();
        }, 500);
    });

    sq.push(sequence_1, true);
    sq.push(sequence_2, true);
    //as array
    sq.push([sequence_3, sequence_4], true);

    sq.fire();

});
