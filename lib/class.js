(function ($, browser) {
    "use strict";

    //
    // Tempus libary to deal with dates
    //
    if(browser) {
        $.Tempus = Tempus;
    } else {
        //in the browser you should include extends_js.js before class.js
        require("./sugar.js");
        $.Tempus = require("./tempus.js");
    }

    var process_data = browser ? {id: 0} : process;

    //
    // internal function mainly for dev
    //

    // <debug>
    /**
     * assert/debug if val dont have the given type, position is to debug the
     * position in the arguments.
     *
     * @param val
     * @param type
     * @param position
     */
    var assert_arg = $.__assert_arg = function (val, type, position) {
        var thr = false;
        if ($.typeof(type) == "array") {
            if (type.indexOf($.typeof(val)) === -1) {
                thr = true;
            }
        } else if ($.typeof(val) != type) {
            thr = true;
        }
        if (thr) {
            if(console.trace) {
                console.trace();
            }
            throw new Error("argument[" + (position || "?") + "] must be " + type + "and is [" +  $.typeof(val) +  "] -> " + val);
        }
    }
    // </debug>

    /**
     * deep debug
     */
    function deep_debug(obj) {
        var key = null;
        for (key in obj) {
            console.log(key, obj[key]);
        }
    }

    //
    // loggin
    //

    // todo tokenize output
    (function ($) {
        function ts_format(value) {
            if (value < 0) {
                value = 0;
            }

            var options = {
                "s": Math.floor(value % 60),
                "m": Math.floor(value / 60) % 60,
                "h": Math.floor(value / 3600) % 24,
                "d": Math.floor(value / 86400)
            };

            options.s = options.s < 10 ? "0" + options.s : options.s;
            options.m = options.m < 10 ? "0" + options.m : options.m;
            options.h = options.h < 10 ? "0" + options.h : options.h;

            if (options.d > 0) {
                return options.d + " " + options.h + ":" + options.m + ":" + options.s;
            }
            return options.h + ":" + options.m + ":" + options.s;
        }

        var levels = [
                "error",
                "warn",
                "info",
                "debug",
                "verbose",
                "__log"
            ],
        //messy colors i know...
            colors = [
                "0;31",
                "1;33",
                "1;36",
                "01;35",
                "01;32",
                "01;32"
            ],
            log = console.log,
            slice = Array.prototype.slice,
            ___program_start = new $.Tempus(),
            ___delta = ___program_start.getTime(),
            i = levels.length;

        $.log_level = 4; //default!

        $.set_log_color = function (level, color) {
            var i = levels.indexOf(level);
            colors[i] = color;
            return $;
        };

        function wrap_debug(level) {
            return function () {
                var color = "\x1B[" + colors[level] + "m",
                    arr,
                    cut,
                    cut2,
                    where = "unkown",
                    d = new $.Tempus(),
                    ms = d.getTime(),
                    date = d.toString("%d %b %H:%M:%S"),
                    seconds_from_start = ts_format((ms - ___program_start.getTime()) / 1000),
                    args;

                if (this.log_level > level) {
                    arr = new Error().stack.split("\n");

                    if (arr[2] !== undefined) {
                        cut = arr[2].lastIndexOf("\\");
                        if (cut === -1) {
                            cut = arr[2].lastIndexOf("/");
                        }
                        if (cut !== -1) {
                            where = arr[2].substring(cut, arr[2].length - 1);
                        }
                    }

                    args = [
                        color,
                        String.sprintf("%s[d%'06f][%s][p%s]%24s|", date, ms - ___delta, seconds_from_start, process_data.pid, where)
                    ].concat(slice.call(arguments));
                    args.push("\x1B[39m");

                    ___delta = ms;

                    log.apply(console, args);
                }
            };
        }

        while (i--) {
            $[levels[i]] = wrap_debug(i);
        }
    }($));

    /**
     * get the type of val. note: undefined/nan is null
     *
     * @param {mixed}
     *            val
     * @returns {String}
     */
    $.typeof = function (val) {
        if (val === null) {
            return "null";
        }
        // dont deal with undefine...
        if (val === undefined) {
            return "null";
        }
        if (val === true || val === false) {
            return "boolean";
        }

        // $.Class instanced
        if (val.$name !== undefined) {
            return val.$name;
        }
        // $.Class prototyping
        if (val.prototype && val.prototype.$name !== undefined) {
            return val.prototype.$name;
        }

        var type = (typeof val).toLowerCase();

        if (type == "object") {
            if (typeof val.length == "number") {
                if (val.callee) {
                    return "arguments";
                }
                if (val instanceof Array) {
                    return "array";
                }
            } else if (val instanceof Date) {
                return "date";
            } else if (val instanceof RegExp) {
                return "regexp";
            }
        }

        if (type == "number" && isNaN(val)) {
            return "null";
        }

        return type;
    };

    /**
     * return is cls is instance of cls_name. To use it you must use the $.Class
     * constructor.
     *
     * @param {Mixed}
     *            cls
     * @param {String}
     *            cls_name
     * @returns {Boolean}
     */
    $.instanceof = function (cls, cls_name) {
        if (!cls || !cls_name) {
            return false;
        }

        var name = (cls.$name || (cls.prototype ? cls.prototype.$name : null)),
            $extended;

        if (name === null) {
            return false;
        }
        if (name == cls_name) {
            return true;
        }

        $extended = (cls.$extended || (cls.prototype && cls.prototype.$extended ? cls.prototype.$extended : null));

        if ($extended === null) {
            return false;
        }

        return $extended.indexOf(cls_name) !== -1;
    };

    /**
     * clone everything excepts functions!
     *
     * @params {Object} to
     * @params {Object} from
     * @params {Boolean} functions
     */
    $.clone = function (obj, recursive) {
        recursive = recursive || true;

        var i,
            clone,
            cloned,
            key;

        switch ($.typeof(obj)) {
        case "string":
            return obj.substring();
        case "array":
            i = obj.length;
            if (i === 0) {
                return [];
            }

            clone = new Array(i);
            while (i--) {
                if (recursive) {
                    clone[i] = $.clone(obj[i], recursive);
                } else {
                    clone[i] = obj[i];
                }
            }
            return clone;
        case "null":
            return null;
        case "number":
            return 0 + obj;
        case "boolean":
            return obj ? true : false;
        case "object":

            cloned = {};
            key = null;
            for (key in obj) {
                if (recursive) {
                    cloned[key] = $.clone(obj[key], recursive);
                } else {
                    cloned[key] = obj[key];
                }
            }

            return cloned;
        case "function":
            return obj;
        case "regexp":
            return new RegExp(obj.source);
        default:
            throw new Error("type[" + $.typeof(obj) + "] cannot be cloned");
        }
    };

    /**
     * clone everything excepts functions!
     *
     * @params {Object} to
     * @params {Object} from
     * @params {Boolean} functions
     */
    $.remove_key_prefixed = function (obj, prefix) {
        if ($.typeof(obj) == "object") {
            var key = null,
                pl = prefix.length;

            for (key in obj) {
                if (key.substring(0, pl) == prefix) {
                    delete obj[key];
                }
            }
            return;
        }

        throw new Error("remove_key_prefixed(object) given[" + $.typeof(obj) + "]");
    };


    /**
     * options naming convetion, not frozen.
     * XXXX normal var
     * _XXX use with caution
     * __XX private cannot be set in the construtor, and serialized if send true
    */
    (function () {
        // need to be tested!!!
        $.Classize = function(cls_name, cls) {
            var ret = $.Class(cls_name, {}),
                key;

            for (key in ret.prototype) {
                cls.prototype[key] = ret.prototype[key];
            }

            ret.prototype = cls.prototype;

            return ret;
        };

        $.Class = function (name, properties, methods) {
            // <debug>
            assert_arg(name, "string", 1);
            assert_arg(properties, "object", 2);
            assert_arg(methods, ["null", "object"], 3);
            // </debug>

            // we can remove "new" right ?
            if (!(this instanceof $.Class)) {
                return new $.Class(name, properties, methods);
            }
            //console.log("new class", name);

            var $self, // this points to the base object, used to check some
                       // prototype things
                $properties = [],
                $methods = [],
                $extends_from = [],
                $abstract_methods = [],
                $final_methods = [],
                $static_methods = [];

            // constructor
            $self = function (options) {
                // <debug>
                if (arguments.length === 1 && !$.instanceof(options, "Class")) { //maybe change...
                    assert_arg(options, "object", 1);
                }

                // abstract_methods check
                var i,
                    max = $abstract_methods.length,
                    found,
                    proto = $self.prototype,
                    opt;

                for (i = 0; i < max; ++i) {
                    if ($methods.indexOf($abstract_methods[i]) === -1) {
                        throw new Error("[" + name + "] abstract_methods class missing method: " + $abstract_methods[i]);
                    }
                }
                // </debug>

                if (this.$name === undefined) {
                    throw new Error("[" + name + "] remember to use new before the name class!");
                }

                max = $properties.length;
                $.__log("cloning options");
                for (i = 0; i < max; ++i) {
                    opt = $properties[i];

                    // this need to be set because otherwise is hidden in console.log
                    // also means the original is modified!! wtf! is new!
                    this[opt] = $.clone(proto[opt]);
                }

                if($.typeof(options) == "object") {
                    Object.merge(this, options, false, true);
                }

                // when the first object is created we should close the class so no
                // futher implement/extend ?
                // ??
                // delete $self.$prototyping;

                if (this.__construct) {
                    this.__construct.apply(this, arguments);
                }

                Object.defineProperty(this, "parent", {
                    value: null,
                    writable : true,
                    enumerable : false, // this should be true ?
                    configurable : false
                });

                // at the end, seal the object.
                // code readability
                Object.seal(this);

                return this;
            };

            // clean prototype to speed up!
            // $self.prototype = Object.create(null);

            // debug
            $self.__proto = $self.prototype;

            Object.defineProperty($self.prototype, "$name", {
                value: name,
                writable : false,
                enumerable : false, // this should be true ?
                configurable : false
            });

            Object.defineProperty($self.prototype, "$extended", {
                value: [ "Class" ],
                writable : true, //study, this could be turn off ? i think writable only affects when instanced
                enumerable : false,
                configurable : false
            });

            // this way we can point to the $.Class instead the instanced
            Object.defineProperty($self.prototype, "$myself", {
                value: $self,
                writable : false,
                enumerable : false,
                configurable : false
            });

            Object.defineProperty($self.prototype, "serialize", {
                value: function (export_private) {
                    // <debug>
                    assert_arg(export_private, ["null", "boolean"], 1);
                    // </debug>

                    export_private = export_private || false;
                    var i,
                        max = $properties.length,
                        proto = $self.prototype,
                        opt,
                        ret = {};

                    $.__log("cloning properties", i, max);
                    for (i = 0; i < max; ++i) {
                        opt = $properties[i];

                        if (!(export_private === false && opt.substring(0, 2) == "__")) {
                            ret[opt] = this[opt];
                        }
                    }

                    return ret;
                },
                writable : false,
                enumerable : false,
                configurable : false
            });

            Object.defineProperty($self.prototype, "deserialize", {
                value: function (options, import_private) {
                    // <debug>
                    assert_arg(options, ["object", "null"], 1);
                    assert_arg(import_private, ["null", "boolean"], 2);
                    // </debug>

                    import_private = import_private || false;

                    return null;
                },
                writable : false,
                enumerable : false,
                configurable : false
            });

            /**
             * implements given methods in this
             * @param {Object} methods
             * @param {Boolean} finale
             */
            $self.implements = function (methods, finale) {
                // <debug>
                assert_arg(methods, "object", 1);
                assert_arg(finale, ["null", "boolean"], 2);
                // </debug>

                finale = finale || false;

                var i = null,
                    target = this.prototype,
                    source = null,
                    stype;

                if (!this.$prototyping) {
                    target = this;
                }

                if ($.instanceof(methods, "Class")) {
                    source = methods.prototype;
                } else {
                    source = methods;
                }

                // object
                for (i in source) {
                    stype = $.typeof(source[i]);
                    if (i == "initialize") {
                        throw new Error("initialize is a forbidden function name use: __construct");
                    }

                    if (stype != "function") {
                        $.warn(i + " is not a function");
                        continue;
                    }

                    if ($final_methods.indexOf(i) !== -1) {
                        throw new Error(i + " is final");
                    }

                    // todo: finale!
                    $methods.push(i);

                    if (finale) {
                        $final_methods.push(i);
                    }

                    if (target[i] !== undefined) {
                        //parent wrap!
                        target[i] = (function () {
                            var parent = target[i],
                                fn = source[i],
                                swap_parent;

                            return function () {
                                swap_parent = this.parent;
                                this.parent = parent;
                                $.__log("set parent, and save the old one", swap_parent, fn, i);
                                var ret = fn.apply(this, arguments);
                                $.__log("release parent, and restore the old one");
                                if (swap_parent === undefined) {
                                    delete this.parent;
                                } else {
                                    this.parent = swap_parent;
                                }
                                return ret;
                            };
                        }());
                    } else {
                        target[i] = source[i];
                    }
                }
            };

            /**
             * implements given methods in this
             * @param {Object} methods
             * @param {Boolean} finale
             */
            $self.static = function (methods) {
                // <debug>
                assert_arg(methods, "object", 1);
                // </debug>

                var i = null,
                    target = this,
                    stype;

                // object
                for (i in methods) {
                    if (i == "initialize") {
                        throw new Error("initialize is a forbidden function name");
                    }

                    stype = $.typeof(methods[i]);
                    if (stype != "function") {
                        $.warn(i + " is not a function");
                        continue;
                    }

                    $static_methods.push(i);

                    Object.defineProperty(target, i, {
                        value: methods[i],
                        writable : false,
                        enumerable : true,
                        configurable : false
                    });
                }
            };


            $self.get_methods = function () {
                return $methods;
            };

            $self.get_abstract_methods = function () {
                return $abstract_methods;
            };

            $self.get_static_methods = function () {
                return $static_methods;
            };

            $self.get_final_methods = function () {
                return $final_methods;
            };
            /**
             * add functions that cannot be reimplemented
             * @param {Object} methods
             */
            $self.final = function (methods) {
                // <debug>
                assert_arg(methods, "object", 1);
                // </debug>

                this.implements(methods, true);
            };
            /**
             * Extends this with the given cls
             * @param Class cls
             * @param {Boolean} override_properties
             */
            $self.extends = function (cls, override_properties, extend_static) {
                // <debug>
                assert_arg(override_properties, ["null", "boolean"], 2);
                assert_arg(extend_static, ["null", "boolean"], 3);
                // </debug>

                if(cls === undefined) {
                    console.log("wtf!");
                    console.trace();
                }

                if (cls.$myself !== undefined) { //this class is instanced use the $.Class
                    cls = cls.$myself;
                }

                if (override_properties !== false) {
                    override_properties = override_properties || true;
                }

                extend_static = extend_static || false;

                $.__log("extends", $.typeof($self), " width ", $.typeof(cls), "override_properties: ", override_properties);

                this.prototype.$extended.push(cls.prototype.$name);
                $extends_from[$.typeof(cls)] = cls;

                var methods = cls.get_methods(),
                    properties = cls.get_properties(),
                    abst = cls.get_abstract_methods(),
                    finals = cls.get_final_methods(),
                    statics,
                    statics_obj,
                    i,
                    max = methods.length,
                    name = null;

                $.__log("extending methods", methods);

                for (i = 0; i < max; ++i) {
                    name = methods[i];

                    $methods.push(name);
                    // parent()!
                    this.prototype[name] = cls.prototype[name];
                }

                $.__log("extending properties", properties);
                max = properties.length;
                for (i = 0; i < max; ++i) {
                    name = properties[i];

                    $.__log("new option: ", name, cls.prototype[name]);

                    if (override_properties === false) {
                        if ($properties.indexOf(name) === -1) {
                            $properties.push(name);
                            this.prototype[name] = cls.prototype[name];
                        }
                    } else {
                        $properties.push(name);
                        this.prototype[name] = cls.prototype[name];
                    }
                }

                $.__log("extending abstract_methods methods", abst);
                max = abst.length;
                for (i = 0; i < max; ++i) {
                    $abstract_methods.push(abst[i]);
                }

                $.__log("extending final methods", finals);
                max = finals.length;
                for (i = 0; i < max; ++i) {
                    $final_methods.push(finals[i]);
                }
                if(extend_static) {
                    $.__log("extending static methods", finals);
                    statics = cls.get_static_methods();
                    max = statics.length;
                    statics_obj = {};
                    for (i = 0; i < max; ++i) {
                        statics_obj[statics[i]] = cls[statics[i]];
                    }
                    this.static(statics_obj);
                }

                return this;
            };
            /**
             * get the option list that is private
             * TODO clone the array?
             */
            $self.get_properties = function () {
                return $properties;
            };

            /**
             * set the properties of a class.
             * - properties prefixed with "__" are considered private
             * -- todo use setters,getters to disallow "get"
             * - use "_" to mark a properties as "used with caution"
             *
             * properties({vector: {x:0}}); // set vector x
             * properties({vector: {y:0}}); // add y to the vector, so xy :)
             *
             * @param {Object} properties
             * @returns this for chaining
             */
            $self.properties = function (properties) {
                // <debug>
                assert_arg(properties, ["object"], 1);
                // </debug>

                var key = null;
                for (key in properties) {
                    $properties.push(key);
                }

                Object.merge(this.prototype, properties, false, false);

                return this;
            };
            /**
             * create an alias of fn_name2, fn_name2 must exists
             *
             * @param String fn_name
             * @param String fn_name2
             */
            $self.alias = function (fn_name, fn_name2) {
                // <debug>
                assert_arg(fn_name, "string", 1);
                assert_arg(fn_name2, "string", 2);
                // </debug>

                if (typeof this.prototype[fn_name2] != "function") {
                    throw new Error("function[" + fn_name2 + "] not found, so cannot be aliased");
                }

                this.prototype[fn_name] = this.prototype[fn_name2];

                $methods.push(fn_name);

                return this;
            };

            /**
             * create an alias of fn_name2, fn_name2 must exists
             *
             * @param String fn_name
             * @param String fn_name2
             */
            $self.abstract = function (methods) {
                // <debug>
                assert_arg(methods, "array", 1);
                // </debug>

                var i,
                    max = methods.length;
                for (i = 0; i < max; ++i) {
                    $abstract_methods.push(methods[i]);
                }

                return this;
            };

            /**
             * hide a function from the prototype using Object.defineProperty enumerable:false
             *
             * @param String fn_name
             * @param String fn_name2
             */
            $self.hide = function (methods) {
                // <debug>
                assert_arg(methods, "array", 1);
                // </debug>

                var i,
                    max = methods.length,
                    fn;

                for (i = 0; i < max; ++i) {
                    if(methods[i] != "__construct") {
                        fn = $self.prototype[methods[i]];
                        delete $self.prototype[methods[i]];

                        Object.defineProperty($self.prototype, methods[i], {
                            value: fn,
                            writable : false,
                            enumerable : false,
                            configurable : false
                        });
                    }
                }

                return this;
            };

            $self.properties(properties);

            $self.$prototyping = true;

            return $self;
        };

    }());

}( typeof module == "undefined" ? window.$ = {} : module.exports, typeof module == "undefined"));
