(function ($, browser) {
    "use strict";

    // here you can find many helpers function in static for performance
    // the exception are functions that are in the prototype

    //
    // Object
    //

    // define Object.defineProperty if not found, no functionality just a replacement so your code not throw!
    if(!Object.defineProperty) {
        Object.defineProperty = function(obj, name, prop) {
            if(prop.get || prop.set) {
                throw new Error("this is not supported in your js.engine");
            }
            obj[name] = prop.value;
        };
    }

    var defineProperty = Object.defineProperty;

    // define Object.seal if not found, no functionality just a replacement so your code not throw!
    if(!Object.seal) {
        Object.seal = function(obj) {
            return seal;
        };
    }

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

    var merge_cloning;
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
    merge_cloning = function (to, from, functions, recursive, must_exists) {
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
                    ret[key] = merge_cloning(to[key], from[key], functions, true, must_exists);
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
            if (from.hasOwnProperty(key) && key != "prototype") {
                ret[key] = from[key];
            }
        }
        return ret;
    };

    Object.merge_cloning = merge_cloning;


    var merge;
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
    merge = function (to, from, functions, must_exists) {
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
            if ($.typeof(to) == "null") { //this way we didn't clone!
                to = from
            } else {
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
                    to[key] = merge(to[key], from[key], functions, must_exists);
                }
            }
            return to;
        }
        return from;
    };

    Object.merge = merge;

    //
    // Function
    //

    // Function.prototype.pass
    defineProperty(Function.prototype, "pass", {
        /**
         * create a function with given args,
         * every time you call the function with any arguments you allways get the same.
         *
         * credits - mootools (Returns a closure with arguments and bind)
         *
         * @note: If you want to send null as arguments use: .pass([null], ?)
         * @param {Mixed} args, should be an array
         * @param {Mixed} bind
         * @return {Function} closure
         */
        value: function (args, bind) {
            var self = this;

            if (args !== null) {
                args = Array.ize(args);
            }

            return function () {
                return self.apply(bind, args || arguments);
            };
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    // Function.prototype.args
    defineProperty(Function.prototype, "args", {
        /**
         * Returns a closure with the given arguments before the ones you send at the call
         * @param {Mixed} args, should be an array
         * @param {Mixed} bind
         * @return {Function} closure
         */
        value: function (args, bind) {
            var self = this;

            if (args !== null) {
                args = Array.ize(args);
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

    // Function.prototype.delay
    defineProperty(Function.prototype, "delay", {
        /**
         * Execute a function in <delay_ms> miliseconds
         *
         * credits - mootools (Delays the execution of a function by a specified duration.)
         *
         * @note use: clearTimeout to stop the scheduled execution
         * @param {Number} delay_ms
         * @param {Mixed} bind
         * @param {Mixed} args
         * @return {Number} the interval so you can clearTimeout
         */
        value: function (delay_ms, bind, args) {
            return setTimeout(this.pass((args === null ? [] : args), bind), delay_ms);
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    // Function.prototype.periodical
    defineProperty(Function.prototype, "periodical", {
        /**
         * execute a function every <periodical_ms> miliseconds
         *
         * credits - mootools (Executes a function in the specified intervals of time. Periodic execution can be stopped using the clearInterval function.)
         *
         * @param {Number} periodical_ms
         * @param {Mixed} bind
         * @param {Mixed} args
         * @return {Number} the interval so you can clearInterval
         */
        value: function (periodical_ms, bind, args) {
            return setInterval(this.pass((args === null ? [] : args), bind), periodical_ms);
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    // Function.prototype.debounce
    defineProperty(Function.prototype, "debounce", {
        /**
         * Returns a function, that, as long as it continues to be invoked, will not
         * be triggered. The function will be called after it stops being called for
         * N milliseconds.
         *
         * credits - underscore
         *
         * @param {Number} wait_ms
         */
        value: function (wait_ms) {
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
                timeout = setTimeout(later, wait_ms);
            };
        },
        writable : false,
        enumerable : false,
        configurable : false
    });

    // Function.prototype.throttle
    defineProperty(Function.prototype, "throttle", {
        /**
         * return a closure that execute a the given function is wait_ms passed from the last time.
         *
         * credits - underscore (Creates and returns a new, throttled version of the passed function, that, when invoked repeatedly, will only actually call the original function at most once per every wait milliseconds. Useful for rate-limiting events that occur faster than you can keep up with.)
         *
         * @param {Number} wait
         */
        value: function (wait_ms) {
            var context,
                args,
                timeout,
                throttling,
                more,
                whenDone = (function () { more = throttling = false; }).debounce(wait_ms),
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
                    timeout = setTimeout(later, wait_ms);
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

    //Function.prototype.once
    defineProperty(Function.prototype, "once", {
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
            return output.join("");
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
                node_type = "",
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

    var slice = Array.prototype.slice;
    /**
     * static function from(item)
     * @memberOf Array
     * @static
     * @param {Mixed} item
     * @returns {Array}
     */
    Array.ize = function (item) {
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
     * @memberOf Array
     * @static
     * @param {Array} ar
     * @returns {Array}
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
     *
     * @memberOf Array
     * @static
     * @param {Array} ar
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
    RegExp.escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

}(typeof module == "undefined" ? window.$ = {} : require("./class.js"), typeof module == "undefined"));