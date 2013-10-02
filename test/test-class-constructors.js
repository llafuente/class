var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//debug
$.log_level = 0;

var CLS1 = new $.Class("CLS1", {
    counter: 0
});
CLS1.Implements({
    __construct: function() {
        ++this.counter;
    }
});


var CLS2 = new $.Class("CLS2", {});

CLS2.Extends(CLS1);

CLS2.Implements({
    __construct: function() {
        this.parent();
        ++this.counter;
    }
});

var CLS3 = new $.Class("CLS3", {});

CLS3.Extends(CLS2);

CLS3.Implements({
    __construct: function() {
        this.parent();
        ++this.counter;
    }
});



//
// -------------------------------------
// -------------------------------------
//


test("properties test", function(t) {

    var x = new CLS3();


    t.equal(x.counter, 3, "counter = 3");

    t.end();
});