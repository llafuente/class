(function ($) {
    "use strict";

    require("./extend_js.js");

    //
    // Tempus libary to deal with dates
    //
    $.Tempus = require("./tempus.js");

    //
    // internal function mainly for dev
    //

    /**
     * assert/debug if val dont have the given type, position is to debug the
     * position in the arguments.
     *
     * @param val
     * @param type
     * @param position
     */
    function assert_types(val, type, position) {
        var thr = false;
        if ($.typeof(type) == "array") {
            if (type.indexOf($.typeof(val)) === -1) {
                thr = true;
            }
        } else if ($.typeof(val) != type) {
            thr = true;
        }
        if (thr) {
            throw new Error("argument[" + (position || "?") + "] must be " + type + "and is [" +  $.typeof(val) +  "] -> " + val);
        }
    }

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
                        if(cut === -1) {
                            cut = arr[2].lastIndexOf("/");
                        }
                        if(cut !== -1) {
                            where = arr[2].substring(cut, arr[2].length - 1);
                        }
                    }

                    args = [
                        color,
                        String.sprintf("%s[d%'06f][%s][p%s]%24s|", date, ms - ___delta, seconds_from_start, process.pid, where)
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
        $.Class = function (name, properties, methods) {
            assert_types(name, "string", 1);
            assert_types(properties, "object", 2);
            assert_types(methods, ["null", "object"], 3);

            // we can remove "new" right ?
            if (!(this instanceof $.Class)) {
                return new $.Class(name, properties, methods);
            }

            var $self, // this points to the base object, used to check some
                       // prototype things
                $properties_list = [],
                $methods_list = [],
                $extends_classes = [],
                $abstract = [],
                $finale_list = [];

            // constructor
            $self = function (options) {
                if (arguments.length === 1) { //maybe change...
                    assert_types(options, "object", 1);
                }
                // abstract check
                var i,
                    max = $abstract.length,
                    found,
                    proto = $self.prototype,
                    opt;

                for (i = 0; i < max; ++i) {
                    if ($methods_list.indexOf($abstract[i]) === -1) {
                        throw new Error("[" + name + "] abstract class missing method: " + $abstract[i]);
                    }
                }

                if (this.$name === undefined) {
                    throw new Error("[" + name + "] remember to use new before the name class!");
                }

                max = $properties_list.length;
                $.__log("cloning options");
                for (i = 0; i < max; ++i) {
                    opt = $properties_list[i];

                    // this need to be set because otherwise is hidden in console.log
                    // also means the original is modified!! wtf! is new!
                    this[opt] = $.clone(proto[opt]);
                }

                Object._merge(this, options, false, true);

                // when the first object is created we should close the class so no
                // futher implement/extend ?
                // ??
                // delete $self.$prototyping;

                if (this.__construct) {
                    this.__construct.apply(this, arguments);
                }

                return this;
            };

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
                    assert_types(export_private, ["null", "boolean"], 1);
                    export_private = export_private || false;
                    var i,
                        max = $properties_list.length,
                        proto = $self.prototype,
                        opt,
                        ret = {};


                    $.__log("cloning properties", i, max);
                    for (i = 0; i < max; ++i) {
                        opt = $properties_list[i];

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
                    assert_types(options, ["object", "null"], 1);
                    assert_types(import_private, ["null", "boolean"], 2);
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
                assert_types(methods, "object", 1);
                assert_types(finale, ["null", "boolean"], 2);

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
                        $.wrn(i + " is not a function");
                        continue;
                    }

                    if ($finale_list.indexOf(i) !== -1) {
                        throw new Error(i + " is final");
                    }

                    // todo: finale!
                    $methods_list.push(i);

                    if (finale) {
                        $finale_list.push(i);
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
                assert_types(methods, "object", 1);

                var i = null,
                    target = this,
                    stype;

                // object
                for (i in methods) {
                    stype = $.typeof(methods[i]);
                    if (i == "initialize") {
                        throw new Error("initialize is a forbidden function name");
                    }

                    if (stype != "function") {
                        $.wrn(i + " is not a function");
                        continue;
                    }

                    target[i] = methods[i];
                }
            };


            $self.get_methods = function () {
                return $methods_list;
            };

            $self.get_abstract_methods = function () {
                return $abstract;
            };

            $self.get_final_methods = function () {
                return $finale_list;
            };
            /**
             * add functions that cannot be reimplemented
             * @param {Object} methods
             */
            $self.final = function (methods) {
                assert_types(methods, "object", 1);

                this.implements(methods, true);
            };
            /**
             * Extends this with the given cls
             * @param Class cls
             * @param {Boolean} override_properties
             */
            $self.extends = function (cls, override_properties) {
                assert_types(override_properties, ["null", "boolean"], 2);

                if (cls.$myself !== undefined) { //this class is instanced use the $.Class
                    cls = cls.$myself;
                }

                if (override_properties !== false) {
                    override_properties = override_properties || true;
                }

                $.__log("extends", $.typeof($self), " width ", $.typeof(cls), "override_properties: ", override_properties);

                this.prototype.$extended.push(cls.prototype.$name);
                $extends_classes[$.typeof(cls)] = cls;

                var methods = cls.get_methods(),
                    properties = cls.get_properties_list(),
                    abst = cls.get_abstract_methods(),
                    finals = cls.get_final_methods(),
                    i,
                    max = methods.length,
                    name = null;

                $.__log("extending methods", methods);

                for (i = 0; i < max; ++i) {
                    name = methods[i];

                    $methods_list.push(name);
                    // parent()!
                    this.prototype[name] = cls.prototype[name];
                }

                $.__log("extending properties", properties);
                max = properties.length;
                for (i = 0; i < max; ++i) {
                    name = properties[i];

                    $.__log("new option: ", name, cls.prototype[name]);

                    if (override_properties === false) {
                        if ($properties_list.indexOf(name) === -1) {
                            $properties_list.push(name);
                            this.prototype[name] = cls.prototype[name];
                        }
                    } else {
                        $properties_list.push(name);
                        this.prototype[name] = cls.prototype[name];
                    }
                }

                $.__log("extending abstract methods", abst);
                max = abst.length;
                for (i = 0; i < max; ++i) {
                    $abstract.push(abst[i]);
                }

                $.__log("extending final methods", finals);
                max = finals.length;
                for (i = 0; i < max; ++i) {
                    $finale_list.push(finals[i]);
                }

                return this;
            };
            /**
             * get the option list that is private
             * TODO clone the array?
             */
            $self.get_properties_list = function () {
                return $properties_list;
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
                assert_types(properties, ["object"], 1);

                var key = null;
                for (key in properties) {
                    $properties_list.push(key);
                }

                Object._merge(this.prototype, properties, false, false);

                return this;
            };
            /**
             * create an alias of fn_name2, fn_name2 must exists
             *
             * @param String fn_name
             * @param String fn_name2
             */
            $self.alias = function (fn_name, fn_name2) {
                assert_types(fn_name, "string", 1);
                assert_types(fn_name2, "string", 2);

                if (typeof this.prototype[fn_name2] != "function") {
                    throw new Error("function[" + fn_name2 + "] not found, so cannot be aliased");
                }
                this.prototype[fn_name] = this.prototype[fn_name2];

                $methods_list.push(fn_name);

                return this;
            };

            /**
             * create an alias of fn_name2, fn_name2 must exists
             *
             * @param String fn_name
             * @param String fn_name2
             */
            $self.abstract = function (methods_list) {
                assert_types(methods_list, "array", 1);

                var i,
                    max = methods_list.length;
                for (i = 0; i < max; ++i) {
                    $abstract.push(methods_list[i]);
                }

                return this;
            };

            /**
             * create an alias of fn_name2, fn_name2 must exists
             *
             * @param String fn_name
             * @param String fn_name2
             */
            $self.hide = function (methods_list) {
                assert_types(methods_list, "array", 1);

                var i,
                    max = methods_list.length,
                    fn;

                for (i = 0; i < max; ++i) {
                    fn = $self.prototype[methods_list[i]];
                    delete $self.prototype[methods_list[i]];

                    Object.defineProperty($self.prototype, methods_list[i], {
                        value: fn,
                        writable : false,
                        enumerable : false,
                        configurable : false
                    });

                }

                return this;
            };

            $self.properties(properties);

            $self.$prototyping = true;

            return $self;
        };

    }());

    /**
     * @returns iterable
     */
    $.Iterable = $.Class("Iterable", {
        objects : [],
        values : {}
    });

    $.Iterable.implements({
        /**
         * @member iterable
         * @param {String}
         *            key
         * @param {Mixed}
         *            value
         */
        set: function (key, value) {
            assert_types(key, "string", 1);

            // if (key == "set" || key == "get" || key == "key" || key == "length" ||
            // key == "rem" || key == "each") throw new Error("invalid key name");
            if (this.values[key] === undefined) {
                this.objects.push(key);
            }
            this.values[key] = value;

            return this;
        },
        /**
         * get the key, null if not found.
         *
         * @member iterable
         * @param {String}
         *            key
         * @returns Mixed
         */
        get: function (key, default_value) {
            assert_types(key, "string", 1);

            var val = this.values[key];
            return val === undefined ? default_value || null : val;
        },
        /**
         * get the key, null if not found.
         *
         * @member iterable
         * @param {String}
         *            key
         * @returns iterable this for chaining
         */
        rem: function (key) {
            assert_types(key, "string", 1);

            var cut = this.objects.indexOf(key);

            if (cut !== -1) {
                delete this.values[key];
                this.objects.splice(cut, 1);
            }

            return this;
        },
        /**
         * apply the function to everything stored, fn(value, key)
         *
         * @member iterable
         * @param {Function}
         *            fn
         * @returns iterable this for chaining
         */
        each : function (fn) {
            assert_types(fn, "function", 1);

            var i,
                max = this.objects.length;

            for (i = 0; i < max; ++i) {
                fn(this.values[this.objects[i]], this.objects[i]);
            }

            return this;
        }
    });

    (function ($) {
        /**
         * wrap the function with event functionality
         * @type Event
         */
        $.Eventize = function (fn) {
            var attached = null;
            fn.$name = "Event";
            fn.$extends = [ "Class" ];
            fn.$ev_times = -1;
            fn.$ev_internal = false;
            //private to use for Events
            fn.__attach = function (event_handler) {
                if (attached !== null) {
                    throw new Error("Event can only be attached once");
                }
                attached = event_handler;
            };
            fn.__detach = function () {
                attached = null;
            };

            fn.is_attached = function () {
                return attached !== null;
            };
            // remove do not remove now, you must be firing the event
            fn.remove = function () {
                this.$ev_times = false;
            };
            fn.stop = function () {
                attached.$ev_stop = true;
            };
            // TODO next / prev / position / length

            return fn;
        };

        /**
         * @type Events
         */
        $.Events = $.Class("Events", {
            $events : {},
            $eventskeys : []
        });


        $.Events.implements({
            /**
             * @member Events
             */
            on : function (event, fn, internal, times) {
                var ev_name;

                //object check
                if ($.typeof(event) == "object") {
                    for (ev_name in event) {
                        this.on(ev_name, event[ev_name]);
                    }
                    return this;
                }

                // attach if its eventized!
                if ($.instanceof(fn, "Event")) {
                    fn.__attach(this);
                }

                this.$events[event] = this.$events[event] || [];
                this.$events[event].push(fn);

                if (this.$eventskeys.indexOf(event) === -1) {
                    this.$eventskeys.push(event);
                }

                if (internal) {
                    fn.$ev_internal = true;
                }

                fn.$ev_times = $.typeof(times) == "null" ? -1 : times;

                return this;
            },
            once: function (event, fn) {
                return this.on(event, fn, false, 0);
            },

            has_listener: function (event) {
                return this.$events[event] ? this.$events[event].length : false;
            },

            emit : function (event, args, delay) {
                args = Array.from(args);

                var events,
                    i,
                    j,
                    jmax,
                    aux,
                    fn,
                    max,
                    check,
                    key;

                if (event.indexOf("*") === -1) {
                    events = this.$events[event];
                } else {
                    check = new RegExp("^" + event.replace("*", "(.*)", "g"));
                    events = [];

                    i = this.$eventskeys.length;
                    while (i--) {
                        key = this.$eventskeys[i];
                        if (check.test(key)) {
                            aux = this.$events[key];

                            jmax = aux.length;
                            for (j = 0; j < jmax; ++j) {
                                aux[j].$__ev_name = key;
                                events.push(aux[j]);
                            }
                        }
                    }
                    event = false;
                }

                if (!events) {
                    return this;
                }

                max = events.length;
                for (i = 0; i < max; ++i) {
                    fn = events[i];
                    if (delay) {
                        fn.delay(delay, fn, /*this*/ args); // !!!<--
                    } else {
                        fn.apply(fn, /*this*/ args);
                    }

                    if (fn.$ev_times === false || fn.$ev_times === 0) {
                        this.off(event || fn.$__ev_name, fn);
                        if (max === 1) {
                            return this;
                        }
                        if (event !== false) { // if has a pattern events array is cloned and not affected by this.off!!
                            --i;
                            --max;
                        }
                    } else {
                        --fn.$ev_times;
                    }
                    //stop ?
                    if (this.$ev_stop === true) {
                        return this;
                    }
                }

                return this;
            },

            off : function (event, fn) {
                var events = this.$events[event],
                    index;

                $.__log("this.$events", this.$events);
                $.__log(events);

                if (events && !fn.$ev_internal) {
                    index = events.indexOf(fn);

                    if (index !== -1) {
                        if (events[index].__detach) {
                            events[index].__detach();
                        }
                        events.splice(index, 1);
                    }
                }
                return this;
            },

            remove_listeners : function (events) {
                var event,
                    fns,
                    i;

                if ($.typeof(events) == "object") {
                    for (event in events) {
                        this.off(event, events[event]);
                    }
                    return this;
                }

                for (event in this.$events) {
                    if (!(events && events != event)) {
                        fns = this.$events[event];
                        i = fns.length;

                        while (i--) {
                            if (fns[i] !== undefined) {
                                this.removeEvent(event, fns[i]);
                            }
                        }
                    }
                }
                return this;
            }
        });
    }($));


    // based on mootoosl, optimized to avoid each, each is evil!
    (function ($) {
        /**
         * @type Seq
         * @events
         *     * newwork
         *     * workdone
         *     * empty
         */
        $.Seq = $.Class("Seq", {
            $queued : [],
            $fired : false
        });

        $.Seq.extends($.Events);

        $.Seq.implements({
            /**
             * @member Seq
             * @param {Function} fn
             */
            push : function (fn, wait) {
                var i,
                    max;
                if ($.typeof(fn) == "array") {
                    max = fn.length;
                    for (i = 0; i < max; ++i) {
                        this.push(fn[i], wait);
                    }
                    return this;
                }
                wait = wait || false;
                this.$queued.push(fn);
                if (!wait) {
                    this.fire();
                }
                this.emit("work:new", [this]);
                return this;
            },

            fire : function (internal) {
                if (this.$queued.length === 0 || this.$fired === true) {
                    if (internal === true) {
                        this.emit("empty", [this]);
                    }
                    return;
                }

                this.$fired = true;
                this.$queued[0](this);

                return this;
            },
            done: function () {
                this.emit("work:done", [this]);
                this.$fired = false;
                this.$queued.shift();
                this.fire(true);
            }
        });

    }($));
}(module.exports || (this.$ = {})));

