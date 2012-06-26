(function () {
    "use strict";

    var $ = require("./class.js");

    //
    // Object
    //
    /**
     * get the keys of an object (or anything iterable for...in) note: remove prototype key
     *
     * @param {Object} object
     * @param {Function} fn
     * @returns {Object} object
     */
    Object.each = function (object, fn) {
        var key = null;
        for (key in object) {
            fn(object[key], key);
        }

        return object;
    };

    /**
     * check if minobj is inside fullobj
     *
     * @param {Mixed}
     *            fullobj
     * @param {Mixed}
     *            minobj
     * @returns {Boolean}
     */
    Object.inside = function (fullobj, minobj) {
        var key = null,
            key2 = null,
            i,
            type1,
            type2;

        for (key in minobj) {
            type1 = $.typeof(minobj[key]);
            type2 = $.typeof(fullobj[key]);

            switch (type1) {
            case "string":
                return fullobj[key] == minobj[key];
            case "null":
            case "number":
            case "boolean":
                return fullobj[key] === minobj[key];
            case "array":
                if (type2 != "array") {
                    return false;
                }
                i = minobj[key].length;
                if (i !== fullobj[key].length) {
                    return false;
                }

                while (i--) {
                    if (fullobj[key].indexOf(minobj[key][i]) != -1) {
                        return false;
                    }
                    // if (!Object.inside(, )) return false;
                }
                break;
            case "object":
                for (key2 in minobj[key]) {
                    if (!Object.inside(fullobj[key][key2], minobj[key][key2])) {
                        return false;
                    }
                }

                break;
            case "function":
                // ignore...
                break;
            default:
                throw new Error("type cannot be compared");
            }
        }
        return true;
    };

    /**
     * ignore prototype but can include functions
     *
     * @params {Object} to
     * @params {Object} from
     * @params {Boolean} functions
     * @params {Boolean} recursive
     * @params {Boolean} must_exists do not allow undefined in the objects
     */
    Object.merge = function (to, from, functions, recursive, must_exists) {
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
                    if (key != "prototype") {
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
                    if (key == "prototype") {
                        continue;
                    }
                    if (to[key] === undefined) {
                        if (must_exists) {
                            continue;
                        }
                        ret[key] = {};
                    }
                    ret[key] = Object.merge(to[key], from[key], functions, true, must_exists);
                }
                return ret;
            }
            $.error(arguments);
            throw new Error("add this type[" + ftype + "] to be merged!");
        }
        for (key in to) {
            if (key != "prototype") {
                ret[key] = to[key];
            }
        }

        for (key in from) {
            if (key != "prototype") {
                ret[key] = from[key];
            }
        }
        return ret;
    };


    /**
     * ignore prototype but can include functions
     *
     * @params {Object} to
     * @params {Object} from
     * @params {Boolean} functions
     * @params {Boolean} recursive
     * @params {Boolean} must_exists do not allow undefined in the objects
     */
    Object._merge = function (to, from, functions, must_exists) {
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
            key = null;
            for (key in from) {
                if (key == "prototype") {
                    continue;
                }
                if (to[key] === undefined) {
                    if (must_exists) {
                        continue;
                    }
                    to[key] = {};
                }
                to[key] = Object._merge(to[key], from[key], functions, must_exists);
            }
            return to;
        }
        return from;
    };


    /**
     * ignore prototype but can include functions
     *
     * @params {Object} to
     * @params {Object} from
     * @params {Boolean} functions
     */
    Object.merge_and_increments = function (to, from, functions) {
        functions = functions || false;
        var key = null;
        for (key in from) {
            if (key != "prototype" && $.typeof(from[key]) == "number") {
                to[key] = (to[key] || 0) + from[key];
            }
        }
    };

    //
    // Function
    //

    /**
     * want to send null -> .pass([null], ?)
     */
    Object.defineProperty(Function.prototype, "pass", {
        /**
         * create a function with given args,
         * every time you call the function with any arguments you allways get the same.
         * from: mootools
         * @param {Mixed} args, should be an array
         * @param {Mixed} bind
         * @return {Function} closure
         */
        value: function (args, bind) {
            var self = this;

            if (args !== null) {
                args = Array.from(args);
            }

            return function () {
                return self.apply(bind, args || arguments);
            };
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    Object.defineProperty(Function.prototype, "args", {
        /**
         * prepend arguments to the passed args!
         * @param {Mixed} args, should be an array
         * @param {Mixed} bind
         * @return {Function} closure
         */
        value: function (args, bind) {
            var self = this;

            if (args !== null) {
                args = Array.from(args);
            } else {
                args = [];
            }

            return function () {
                return self.apply(bind,
                        Array.append(args, Array.prototype.slice.call(arguments))
                    );
            };
        },
        writable : false,
        enumerable : false,
        configurable : false
    });


    Object.defineProperty(Function.prototype, "delay", {
        /**
         * execute a function in <delay> miliseconds
         * from: mootools
         * @param {Number} delay
         * @param {Mixed} bind
         * @param {Mixed} args
         * @return {Number} the interval so you can clearTimeout
         */
        value: function (delay, bind, args) {
            return setTimeout(this.pass((args === null ? [] : args), bind), delay);
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    Object.defineProperty(Function.prototype, "periodical", {
        /**
         * execute a function every <periodical> miliseconds
         * from: mootools
         * @param {Number} periodical
         * @param {Mixed} bind
         * @param {Mixed} args
         * @return {Number} the interval so you can clearInterval
         */
        value: function (periodical, bind, args) {
            return setInterval(this.pass((args === null ? [] : args), bind), periodical);
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    //
    //
    //
    Object.defineProperty(Function.prototype, "debounce", {
        /**
         * Returns a function, that, as long as it continues to be invoked, will not
         * be triggered. The function will be called after it stops being called for
         * N milliseconds.
         * from: underscore
         * @param {Number} wait
         */
        value: function (wait) {
            var timeout,
                func = this;
            return function () {
                var context = this,
                    args = arguments,
                    later = function () {
                        timeout = null;
                        func.apply(context, args);
                    };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    Object.defineProperty(Function.prototype, "throttle", {
        /**
         * create a funcion that is executed a maximum times per second.
         * from: underscore
         * @param {Number} wait
         */
        value: function (wait) {
            var context,
                args,
                timeout,
                throttling,
                more,
                whenDone = (function () { more = throttling = false; }).debounce(wait),
                func = this;

            return function () {
                context = this;
                args = arguments;
                var later = function () {
                    timeout = null;

                    if (more) {
                        func.apply(context, args);
                    }

                    whenDone();
                };
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (throttling) {
                    more = true;
                } else {
                    func.apply(context, args);
                }
                whenDone();
                throttling = true;
            };
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    Object.defineProperty(Function.prototype, "once", {
        /**
         * Returns a function that will be executed at most one time, no matter how
         * often you call it. Useful for lazy initialization.
         */
        value: function () {
            var ran = false,
                memo,
                func = this;

            return function () {
                if (ran) {
                    return memo;
                }

                ran = true;
                return (memo = func.apply(this, arguments));
            };
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    //
    // String
    //

    /*!
    sprintf() for JavaScript 0.7-beta1
    http://www.diveintojavascript.com/projects/javascript-sprintf

    Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.
        * Neither the name of sprintf() for JavaScript nor the
          names of its contributors may be used to endorse or promote products
          derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


    Changelog:
    2010.09.06 - 0.7-beta1
      - features: vsprintf, support for named placeholders
      - enhancements: format cache, reduced global namespace pollution

    2010.05.22 - 0.6:
     - reverted to 0.4 and fixed the bug regarding the sign of the number 0
     Note:
     Thanks to Raphael Pigulla <raph (at] n3rd [dot) org> (http://www.n3rd.org/)
     who warned me about a bug in 0.5, I discovered that the last update was
     a regress. I appologize for that.

    2010.05.09 - 0.5:
     - bug fix: 0 is now preceeded with a + sign
     - bug fix: the sign was not at the right position on padded results (Kamal Abdali)
     - switched from GPL to BSD license

    2007.10.21 - 0.4:
     - unit test and patch (David Baird)

    2007.09.17 - 0.3:
     - bug fix: no longer throws exception on empty paramenters (Hans Pufal)

    2007.09.11 - 0.2:
     - feature: added argument swapping

    2007.04.03 - 0.1:
     - initial release
    **/

    /**
     * static function sprintf(format, ...)
     * @memberOf   String
     * @param {String} format
     * @returns {String}
     * @static
     * @see     String
    */
    String.sprintf = (function () {
        function get_type(variable) {
            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
        }
        function str_repeat(input, multiplier) {
            var output;
            for (output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
            return output.join('');
        }

        var str_format = function () {
            if (!str_format.cache.hasOwnProperty(arguments[0])) {
                str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
            }
            return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
        };

        str_format.format = function (parse_tree, argv) {
            var cursor = 1,
                tree_length = parse_tree.length,
                node_type = '',
                arg,
                output = [],
                i,
                k,
                match,
                pad,
                pad_character,
                pad_length;

            for (i = 0; i < tree_length; i++) {
                node_type = get_type(parse_tree[i]);
                if (node_type === 'string') {
                    output.push(parse_tree[i]);
                } else if (node_type === 'array') {
                    match = parse_tree[i]; // convenience purposes only
                    if (match[2]) { // keyword argument
                        arg = argv[cursor];
                        for (k = 0; k < match[2].length; k++) {
                            if (!arg.hasOwnProperty(match[2][k])) {
                                throw String.sprintf('[sprintf] property "%s" does not exist', match[2][k]);
                            }
                            arg = arg[match[2][k]];
                        }
                    } else if (match[1]) { // positional argument (explicit)
                        arg = argv[match[1]];
                    } else { // positional argument (implicit)
                        arg = argv[cursor++];
                    }

                    if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                        throw String.sprintf('[sprintf] expecting number but found %s', get_type(arg));
                    }
                    switch (match[8]) {
                    case 'b':
                        arg = arg.toString(2);
                        break;
                    case 'c':
                        arg = String.fromCharCode(arg);
                        break;
                    case 'd':
                        arg = parseInt(arg, 10);
                        break;
                    case 'e':
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                        break;
                    case 'f':
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                        break;
                    case 'o':
                        arg = arg.toString(8);
                        break;
                    case 's':
                        arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg);
                        break;
                    case 'u':
                        arg = Math.abs(arg);
                        break;
                    case 'x':
                        arg = arg.toString(16);
                        break;
                    case 'X':
                        arg = arg.toString(16).toUpperCase();
                        break;
                    }
                    arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg);
                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                    pad_length = match[6] - String(arg).length;
                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                    output.push(match[5] ? arg + pad : pad + arg);
                }
            }
            return output.join('');
        };

        str_format.cache = {};

        str_format.parse = function (fmt) {
            var _fmt = fmt,
                match = [],
                parse_tree = [],
                arg_names = 0,
                field_list,
                replacement_field,
                field_match;
            while (_fmt) {
                if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                    parse_tree.push(match[0]);
                } else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                    parse_tree.push('%');
                } else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                    if (match[2]) {
                        arg_names |= 1;

                        field_list = [];
                        replacement_field = match[2];
                        field_match = [];

                        if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                            field_list.push(field_match[1]);
                            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                } else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                    field_list.push(field_match[1]);
                                } else {
                                    throw '[sprintf] huh?';
                                }
                            }
                        } else {
                            throw '[sprintf] huh?';
                        }
                        match[2] = field_list;
                    } else {
                        arg_names |= 2;
                    }
                    if (arg_names === 3) {
                        throw '[sprintf] mixing positional and named placeholders is not (yet) supported';
                    }
                    parse_tree.push(match);
                } else {
                    throw '[sprintf] huh?';
                }
                _fmt = _fmt.substring(match[0].length);
            }
            return parse_tree;
        };

        return str_format;
    }());

    String.vsprintf = function (fmt, argv) {
        argv.unshift(fmt);
        return String.sprintf.apply(null, argv);
    };

    //
    // Array
    //

    /**
     * static function from(item)
     * @memberOf   Array
     * @param {Mixed} item
     * @returns {Array}
     * @static
     * @see     Array
    */
    Array.from = function (item) {
        var type = $.typeof(item),
            out,
            i;

        switch (type) {
        case 'null':
            return [];
        case 'array':
            return item;
        case 'arguments':
            return Array.prototype.slice.call(item);
        case 'object':
            out = [];
            for (i in item) {
                out[i] = item[i];
            }
            return out;
        default:
            return [ item ];
        }
    };

    /**
     * static function from(item)
     * @memberOf   Array
     * @param {Mixed} item
     * @returns {Array}
     * @static
     * @see     Array
    */
    Array.append = function (ar, ar2) {
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
     * @memberOf   Array
     * @param {Mixed} item
     * @returns {Array}
     * @static
     * @see     Array
    */
    Array.clone = function (ar) {
        var i = ar.length, clone = new Array(i);
        while (i--) {
            clone[i] = ar[i];
        }
        return clone;
    };

    /**
     * Add an element at the specified index
     * @param {Object} o The object to add
     * @param {int} index The index position the element has to be inserted
     * @return {Boolean} True if you can insert
     */
    Array.insertAt = function (ar, o, index) {
        if (index > -1 && index <= ar.length) {
            ar.splice(index, 0, o);
            return true;
        }
        return false;
    };




    /**
     * static function escape(text)
     * @memberOf   RegExp
     * @param {String} text
     * @returns {String}
     * @static
     * @see     String
    */
    RegExp.escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

}());