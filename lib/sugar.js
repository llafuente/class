(function (exports, browser) {
    "use strict";

    // here you can find many helpers function in static for performance
    // the exception are functions that are in the prototype

    var $;

    if (browser) {
        $ = exports;
    } else {
        $ = require("./class.js");
    }

    //
    // Object
    //

    // define Object.defineProperty if not found, no functionality just a replacement so your code not throw!
    if (!Object.defineProperty) {
        Object.defineProperty = function (obj, name, prop) {
            if (prop.get || prop.set) {
                throw new Error("this is not supported in your js.engine");
            }
            obj[name] = prop.value;
        };
    }


    // define Object.seal if not found, no functionality just a replacement so your code not throw!
    if (!Object.seal) {
        Object.seal = function (obj) {
            return obj;
        };
    }

    var defineProperty = Object.defineProperty,
        ObjectMergeCloning,
        ObjectMerge,
        ObjectEach,
        slice = Array.prototype.slice,
        RegExpEscape,
        ArrayIze,
        ArrayClone,
        ArrayAppend,
        ArrayInsertAt;

    /**
     * get the keys of an object (or anything iterable for...in) note: remove prototype key
     *
     * @param {Object} object
     * @param {Function} fn
     * @returns {Object} object
     */
    ObjectEach = function (object, fn) {
        var key = null;
        for (key in object) {
            fn(object[key], key);
        }

        return object;
    };

    /**
     * ignore prototype but can include functions
     *
     * @todo add some test and create some debug code to check type and rare things
     *
     * @params {Object} to
     * @params {Object} from
     * @params {Boolean} functions
     * @params {Boolean} recursive
     * @params {Boolean} must_exists do not allow undefined in the objects
     */
    ObjectMergeCloning = function (to, from, functions, recursive, must_exists) {
        functions = functions || false;
        must_exists = must_exists || false;
        recursive = recursive || false;

        var ret = {},
            ftype,
            key;

        if (recursive === true) {
            ftype = $.typeof(from);

            switch ($.typeof(to)) {
            case "object":
                for (key in to) {
                    if (key !== "prototype") {
                        ret[key] = to[key];
                    }
                }
                break;
            case "array":
                ret = Array.clone(ret);
                break;
            }


            switch (ftype) {
            case "string":
            case "number":
            case "array":
            case "boolean":
                return from;
            case "null":
                return null;
            case "function":
                if (!functions) {
                    return null; //null?
                }
                return from;
            case "object":
                key = null;
                for (key in from) {
                    if (key === "prototype") {
                        continue;
                    }
                    if (to[key] === undefined) {
                        if (must_exists) {
                            continue;
                        }
                        ret[key] = {};
                    }
                    ret[key] = ObjectMergeCloning(to[key], from[key], functions, true, must_exists);
                }
                return ret;
            }
            $.error(arguments);
            throw new Error("add this type[" + ftype + "] to be merged!");
        }
        for (key in to) {
            if (key !== "prototype") {
                ret[key] = to[key];
            }
        }

        for (key in from) {
            if (from.hasOwnProperty(key) && key !== "prototype") {
                ret[key] = from[key];
            }
        }
        return ret;
    };



    /**
     * ignore prototype but can include functions
     *
     * @todo add some test and create some debug code to check type and rare things
     *
     * @params {Object} to, this parameter is mofified
     * @params {Object} from
     * @params {Boolean} functions
     * @params {Boolean} recursive
     * @params {Boolean} must_exists do not allow undefined in the objects
     */
    ObjectMerge = function (to, from, functions, must_exists) {
        functions = functions || false;
        must_exists = must_exists || false;

        var ftype = $.typeof(from),
            key;

        switch (ftype) {
        case "string":
        case "number":
        case "array":
        case "boolean":
            return from;
        case "null":
            return null;
        case "function":
            if (!functions) {
                return null; //null?
            }
            return from;
        case "object":
            // if has prototype just copy
            if ($.typeof(to) === "null") { //this way we didn't clone!
                to = from;
            } else {
                key = null;
                for (key in from) {
                    if (key === "prototype") {
                        continue;
                    }

                    if (to[key] === undefined) {
                        if (must_exists) {
                            continue;
                        }
                        to[key] = {};
                    }
                    to[key] = ObjectMerge(to[key], from[key], functions, must_exists);
                }
            }
            return to;
        }
        return from;
    };

    //
    // Array
    //

    /**
     * static function from(item)
     * @memberOf Array
     * @static
     * @param {Mixed} item
     * @returns {Array}
     */
    ArrayIze = function (item) {
        var type = $.typeof(item),
            out,
            i;

        switch (type) {
        case "null":
            return [];
        case "array":
            return item;
        case "arguments":
            return slice.call(item);
        // TODO deal with Iterable objects like Collections!
        default:
            return [ item ];
        }
    };

    /**
     * static function from(item)
     * @memberOf Array
     * @static
     * @param {Array} ar
     * @param {Array} ar2
     * @returns {Array}
    */
    ArrayAppend = function (ar, ar2) {
        var i,
            j,
            max = ar.length,
            jmax = ar2.length,
            ret = new Array(max + jmax);

        for (i = 0; i < max; ++i) {
            ret[i] = ar[i];
        }

        for (j = 0; j < jmax; ++j, ++i) {
            ret[i] = ar2[j];
        }

        return ret;
    };

    /**
     * static function from(item)
     * @memberOf Array
     * @static
     * @param {Array} ar
     * @returns {Array}
    */
    ArrayClone = function (ar) {
        var i = ar.length, clone = new Array(i);
        while (i--) {
            clone[i] = ar[i];
        }
        return clone;
    };

    /**
     * Add an element at the specified index
     *
     * @memberOf Array
     * @static
     * @param {Array} ar
     * @param {Object} o The object to add
     * @param {int} index The index position the element has to be inserted
     * @return {Boolean} True if you can insert
     */
    ArrayInsertAt = function (ar, o, index) {
        if (index > -1 && index <= ar.length) {
            ar.splice(index, 0, o);
            return true;
        }
        return false;
    };


    //
    // RegExp
    //


    /**
     * static function escape(text)
     *
     * @memberOf RegExp
     * @static
     * @param {String} text
     * @returns {String}
    */
    RegExpEscape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    if(browser) {
        RegExp.escape = RegExpEscape;
        Object.mergecloning = ObjectMergeCloning;
        Object.merge = ObjectMerge;
        Object.each = ObjectEach;
        Array.ize = ArrayIze;
        Array.clone = ArrayClone;
        Array.Append = ArrayAppend;
        Array.insertAt = ArrayInsertAt;
    } else {
        exports.RegExpEscape = RegExpEscape;
        exports.ObjectMergeCloning = ObjectMergeCloning;
        exports.ObjectMerge = ObjectMerge;
        exports.ObjectEach = ObjectEach;
        exports.ArrayIze = ArrayIze;
        exports.ArrayClone = ArrayClone;
        exports.ArrayInsertAt = ArrayInsertAt;
    }

}(typeof module === "undefined" ? NodeClass : module.exports, typeof module === "undefined"));
