var Benchmark = require('benchmark'),
    $ = require('../index.js'),
    Iterable_it,
    CIterable_it,
    cb = function(k,v) {  };
    suite = new Benchmark.Suite,
    suite2 = new Benchmark.Suite;

console.log("closure class vs use of $.Class (Iterable)");
console.log("closure pro: hide objects, values so anyone can mess with them");
console.log("Class pro: speed :)");

console.log();
console.log("Explanation");
console.log("IMO: v8 has to parse the closure each time and set the proper enviroments var for each function, so it cannot cache");
console.log();

console.log("Benchmark: high is better");

//
//

/**
 * note this class could be deprecated, because it not maintained anymore, Class has better results
 * @returns iterable
 */
$.ClosureIterable = function () {
    var objects = [],
        values = {},
        /**
         * @type iterable
         */
        cls = function() {};
    // class compatibility
    cls.$name = "Iterable";
    cls.$extended = [ "Class" ];

    /**
     * @member iterable
     * @param {String}
     *            key
     * @param {Mixed}
     *            value
     */
    cls.set = function (key, value) {
        // if (key == "set" || key == "get" || key == "key" || key == "length" ||
        // key == "rem" || key == "each") throw new Error("invalid key name");
        if (values[key] === undefined) {
            objects.push(key);
        }
        values[key] = value;

        return this;
    };
    /**
     * get the key, null if not found.
     *
     * @member iterable
     * @param {String}
     *            key
     * @returns Mixed
     */
    cls.get = function (key, default_value) {
        var val = values[key];
        return val === undefined ? default_value || null : val;
    };
    /**
     * get the key, null if not found.
     *
     * @member iterable
     * @param {String}
     *            key
     * @returns iterable this for chaining
     */
    cls.rem = function (key) {
        var cut = objects.indexOf(key);

        if (cut !== -1) {
            delete values[key];
            objects.splice(cut, 1);
        }

        return this;
    };
    /**
     * apply the function to everything stored, fn(value, key)
     *
     * @member iterable
     * @param {Function}
     *            fn
     * @returns iterable this for chaining
     */
    cls.each = function (fn) {
        var i,
            max = objects.length;

        for (i = 0; i < max; ++i) {
            fn(values[objects[i]], objects[i]);
        }

        return this;
    };

    return cls;
};


suite
.add('iterable#Class', function() {
    Iterable_it = new $.Iterable()
        .set("field1" , "value1")
        .set("field2" , 2)
        .set("field3" , {})
        .set("field4" , [])
        .set("field5" , new Date());
})
.add('iterable#Closure', function() {
    CIterable_it = new $.ClosureIterable()
        .set("field1" , "value1")
        .set("field2" , 2)
        .set("field3" , {})
        .set("field4" , [])
        .set("field5" , new Date());
})
// add listeners
.on('cycle', function(event, data) {
    console.log(data.name, data.count);

})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));

    var gain = Math.round((this.filter('fastest').pluck('count') / this.filter('slowest').pluck('count')) * 100, 3)

    console.log('Increment ', gain, '%');
})
// run async
.run({ 'async': false });




suite2
.add('iterable#Class', function() {
    Iterable_it.each(cb);
})
.add('iterable#Closure', function() {
    CIterable_it.each(cb);
})
// add listeners
.on('cycle', function(event, data) {
    console.log(data.name, data.count);

})
.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));

    var gain = Math.round((this.filter('fastest').pluck('count') / this.filter('slowest').pluck('count')) * 100, 3)

    console.log('Increment ', gain, '%');
})
// run async
.run({ 'async': false });