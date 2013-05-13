var $ = require("../index.js"),
    tap = require("tap"),
    test = tap.test;

//debug
$.log_level = 0;

var CLS1 = $.Class("CLS1", {
    counter: 0
});
CLS1.implements({
    __construct: function() {
        ++this.counter;
    }
});


var CLS2 = $.Class("CLS2", {});

CLS2.extends(CLS1);

CLS2.implements({
    __construct: function() {
        this.parent();
        ++this.counter;
    }
});

var CLS3 = $.Class("CLS3", {});

CLS3.extends(CLS2);

CLS3.implements({
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