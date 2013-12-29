(function (exports, browser) {
    "use strict";

    var Class = browser ? exports.Class : require("./class.js").Class,
        assert_arg = browser ? exports.__assert_arg : require("./class.js").__assert_arg,
        create = Object.create;

    /**
     * @returns iterable
     */
    exports.Iterable = new Class("Iterable", {
        $__keys: [],
        $__values: null,
        $__current_id: 0
    });

    exports.Iterable.Implements({
        __construct: function () {
            this.empty();
        },
        /**
         * @member iterable
         * @param {String} key
         * @param {Mixed} value
         */
        set: function (key, value) {
            // <debug>
            assert_arg(key, "string", 1);
            // </debug>

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
         * @member iterable
         * @param {String} key
         * @returns Mixed
         */
        get: function (key, default_value) {
            // <debug>
            assert_arg(key, "string", 1);
            // </debug>

            var val = this.$__values[key];
            return val === undefined ? default_value || null : val;
        },
        empty: function () {
            this.$__values = create(null);
            this.$__keys = [];
        },
        /**
         * get the key, null if not found.
         *
         * @member iterable
         * @param {String} key
         * @returns iterable this for chaining
         */
        rem: function (key) {
            // <debug>
            assert_arg(key, "string", 1);
            // </debug>

            var cut = this.$__keys.indexOf(key);

            if (cut !== -1) {
                delete this.$__values[key];
                this.$__keys.splice(cut, 1);
            }

            return this;
        },
        erase: function (value) {

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                if (vals[objs[i]] === value) {
                    delete this.$__values[objs[i]];
                    this.$__keys.splice(i, 1);
                    --max;
                    --i;
                }
            }
            return this;
        },
        /**
         * apply the function to everything stored, fn(value, key)
         *
         * @member iterable
         * @param {Function} fn
         * @returns iterable this for chaining
         */
        forEach : function (fn) {
            // <debug>
            assert_arg(fn, "function", 1);
            // </debug>

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                fn(vals[objs[i]], objs[i]);
            }

            return this;
        },
        search: function(fn) {
            // <debug>
            assert_arg(fn, "function", 1);
            // </debug>

            var objs = this.$__keys,
                vals = this.$__values,
                i,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                if (fn(vals[objs[i]], objs[i]) === true) {
                    return vals[objs[i]];
                }
            }

            return null;
        },
        reset: function () {
            this.$__current_id = 0;
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
            if(this.$__current_id === this.$__keys.length) {
                return null;
            }

            var k = this.$__keys[this.$__current_id];
            return {
                key: k,
                value: this.$__values[k]
            };
        },
        eof: function () {
            return this.$__current_id == this.$__keys.length;
        },
        sort: function(sort_function) {
            this.$__keys.sort(sort_function);
        },
        getKeys: function() {
            return this.$__keys.splice(0); //clone!
        }
    });

}(typeof module === "undefined" ? NodeClass : module.exports, typeof module === "undefined"));