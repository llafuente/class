(function(exports, browser) {
    var Class = browser ? $.Class : require("./class.js").Class;

    /**
     * @returns iterable
     */
    exports.Iterable = Class("Iterable", {
        $__objects : [],
        $__values : null
    });

    exports.Iterable.implements({
        __construct: function() {
            this.$__values = Object.create(null);
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
        /**
         * apply the function to everything stored, fn(value, key)
         *
         * @member iterable
         * @param {Function} fn
         * @returns iterable this for chaining
         */
        each : function (fn) {
            // <debug>
            assert_arg(fn, "function", 1);
            // </debug>

            var i,
                max = this.$__objects.length;

            for (i = 0; i < max; ++i) {
                fn(this.$__values[this.$__objects[i]], this.$__objects[i]);
            }

            return this;
        }
    });

}(typeof module == "undefined" ? $ : module.exports, typeof module == "undefined"));