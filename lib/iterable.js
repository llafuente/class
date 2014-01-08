(function (exports, browser) {
    "use strict";

    var Class = browser ? exports.Class : require("./class.js")["class"],
        __typeof = browser ? exports.__typeof : require("./class.js")["typeof"],
        create = Object.create,
        strictEqual = require('assert').strictEqual,
        debug = true;

    /**
     * @return Iterable
     */
    exports.Iterable = new Class("Iterable", {
        $__keys: [],
        $__values: null,
        $__current_id: 0,

        initialize: function () {
            this.empty();
        },
        /**
         * @member Iterable
         * @param {String} key
         * @param {Mixed} value
         */
        set: function (key, value) {
            if (debug) {
                strictEqual(__typeof(key), "string", "key must be a string");
            }

            // if (key == "set" || key == "get" || key == "key" || key == "length" ||
            // key == "rem" || key == "each") throw new Error("invalid key name");
            if (this.$__values[key] === undefined) {
                this.$__keys.push(key);
            }
            this.$__values[key] = value;

            return this;
        },
        /**
         * get the key, null if not found.
         *
         * @member Iterable
         * @param {String} key
         * @param {mixed} default_value default is null
         * @returns Mixed
         */
        get: function (key, default_value) {
            if (debug) {
                strictEqual(__typeof(key), "string", "key must be a string");
            }

            var val = this.$__values[key];
            return val === undefined ? default_value || null : val;
        },
        /**
         * remove all
         *
         * @member Iterable
         * @returns Iterable this for chaining
         */
        empty: function () {
            this.$__values = create(null);
            this.$__keys = [];
        },
        /**
         * remove given key
         *
         * @member Iterable
         * @param {String} key
         * @returns Iterable this for chaining
         */
        rem: function (key) {
            if (debug) {
                strictEqual(__typeof(key), "string", "key must be a string");
            }

            var cut = this.$__keys.indexOf(key);

            if (cut !== -1) {
                delete this.$__values[key];
                this.$__keys.splice(cut, 1);
            }

            return this;
        },
        /**
         * remove every apparency
         *
         * @member Iterable
         * @param {Mixed} value
         * @returns Iterable this for chaining
         */
        erase: function (value) {
            var objs = this.$__keys,
                vals = this.$__values,
                i,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                if (vals[objs[i]] === value) {
                    delete this.$__values[objs[i]];
                    this.$__keys.splice(i, 1);

                    if (i === this.$__current_id && this.eof()) {
                        this.prev();
                    }

                    --max;
                    --i;
                }
            }
            return this;
        },
        reset: function () {
            this.$__current_id = 0;
        },
        end: function () {
            this.$__current_id = this.$__keys.length - 1;
        },
        prev: function () {
            this.$__current_id = Math.max(0, this.$__current_id - 1);
            return this.current();
        },
        next: function () {
            this.$__current_id = Math.min(this.$__keys.length, this.$__current_id + 1);
            return this.current();
        },
        current: function () {
            if (this.$__current_id === this.$__keys.length) {
                return null;
            }

            var k = this.$__keys[this.$__current_id];
            return {
                key: k,
                value: this.$__values[k]
            };
        },
        eof: function () {
            return this.$__current_id === this.$__keys.length;
        },
        sort: function (sort_function) {
            if (debug) {
                strictEqual(__typeof(sort_function), "function", "sort_function must be a function");
            }

            this.$__keys.sort(sort_function);
        },
        getKeys: function () {
            return this.$__keys.splice(0); //clone!
        },

        /**
         * The forEach() method executes a provided function once per array element.
         *
         *
         * @member Iterable
         * @param {Function} fn callback arguments(value, key)
         * @returns Iterable this for chaining
         */
        forEach : function (fn) {
            if (debug) {
                strictEqual(__typeof(fn), "function", "fn must be a function");
            }

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                k,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                k = objs[i];

                fn(vals[k], k);
            }

            return this;
        },
        /**
         * The filter() method creates a new array with all elements that pass the test implemented by the provided function.
         *
         * @member Iterable
         * @param {Function} fn callback arguments(value, key)
         * @returns Array
        */
        filter: function (fn) {
            if (debug) {
                strictEqual(__typeof(fn), "function", "fn must be a function");
            }

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                k,
                v,
                max = objs.length,
                res = [];

            for (i = 0; i < max; ++i) {
                k = objs[i];
                v = vals[k];

                if (fn(v, k)) {
                    res.push(v);
                }
            }

            return res;
        },
        /**
         * The some() method tests whether some element in the array passes the test implemented by the provided function.
         *
         * @member Iterable
         * @param {Function} fn callback arguments(value, key)
         * @returns Boolean
         */
        some: function (fn) {
            if (debug) {
                strictEqual(__typeof(fn), "function", "fn must be a function");
            }

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                k,
                v,
                max = objs.length,
                res;

            for (i = 0; i < max; ++i) {
                k = objs[i];
                v = vals[k];

                if (fn(v, k)) {
                    return true;
                }
            }

            return false;
        },
        /**
         * The every() method tests whether all elements in the array pass the test implemented by the provided function.
         *
         * @member Iterable
         * @param {Function} fn callback arguments(value, key)
         * @returns Boolean
         */
        every: function (fn) {
            if (debug) {
                strictEqual(__typeof(fn), "function", "fn must be a function");
            }

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                k,
                v,
                max = objs.length,
                res;

            for (i = 0; i < max; ++i) {
                k = objs[i];
                v = vals[k];

                if (!fn(v, k)) {
                    return false;
                }
            }

            return true;
        },
        /**
         * The firstOf() method return {key,value} of the first true test.
         *
         * @member Iterable
         * @param {Function} fn callback arguments(value, key)
         * @returns Boolean
         */
        firstOf: function (fn) {
            if (debug) {
                strictEqual(__typeof(fn), "function", "fn must be a function");
            }

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                k,
                v,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                k = objs[i];
                v = vals[k];

                if (fn(v, k) === true) {
                    return {key: k, value: v};
                }
            }

            return null;
        }
    });

}("undefined" === typeof module ? NodeClass : module.exports, "undefined" === typeof module));
