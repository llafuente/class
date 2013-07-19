(function (exports, browser) {
    "use strict";

    var Class = browser ? exports.Class : require("./class.js").Class,
        assert_arg = browser ? exports.__assert_arg : require("./class.js").__assert_arg,
        create = Object.create;

    /**
     * @returns iterable
     */
    exports.Iterable = new Class("Iterable", {
        $__objects : [],
        $__values : null
    });

    exports.Iterable.implements({
        __construct: function () {
            this.$__values = create(null);
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
                this.$__objects.push(key);
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
            this.$__objects = [];
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

            var cut = this.$__objects.indexOf(key);

            if (cut !== -1) {
                delete this.$__values[key];
                this.$__objects.splice(cut, 1);
            }

            return this;
        },
        erase: function (value) {

            var objs = this.$__objects,
                vals = this.$__values,
                i,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                if (vals[objs[i]] === value) {
                    delete this.$__values[objs[i]];
                    this.$__objects.splice(i, 1);
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

            var objs = this.$__objects,
                vals = this.$__values,
                i,
                max = objs.length;

            for (i = 0; i < max; ++i) {
                fn(vals[objs[i]], objs[i]);
            }

            return this;
        }
    });

}(typeof module === "undefined" ? NodeClass : module.exports, typeof module === "undefined"));