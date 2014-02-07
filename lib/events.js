(function (exports, browser) {
    "use strict";

    var array = require("array-enhancements"),
        Class = browser ? exports.Class : require("./class.js")["class"],
        __typeof = browser ? exports.__typeof : require("./class.js")["typeof"],
        Eventize = require("./eventize.js").Eventize,
        notStrictEqual = require("assert").notStrictEqual,
        strictEqual = require("assert").strictEqual,
        debug = true,
        arraySplice = Array.prototype.splice,
        Events;
        //__instanceof = browser ? exports.Instanceof : require("./class.js").Instanceof;

    //
    // Events (Event Emitter)
    // support

    /**
     * @type Events
     */
    exports.Events = Events = new Class("Events", {
        "hidden $__events": null,
        "hidden $__eventskeys": null,
        "hidden $__pipes": null,

        initialize: function (options) {
            var i,
                k;

            this.$__events = Object.create(null);
            this.$__eventskeys = [];
            this.$__pipes = [];

            if (options) {
                if ("[object Object]" === (options.toString && options.toString())) {
                    for (i in options) {
                        // ultra-fast check for onUcase keys
                        if (i.length > 3 && i[0] === "o" && i[1] === "n" && i[2] === i[2].toUpperCase()) {
                            if (debug) {
                                strictEqual(typeof options[i], "function", i + " must be a function");
                            }

                            k = Events.$transform(i);

                            this.addListener(k, options[i]);
                        }
                    }
                }
            }
        },
        on_unhandled_event: function (fn) {
            return this.addListener("*", fn);
        },
        /**
         * @member Events
         */
        addListener: function (event, fn, times, internal) { //TODO: push on unshift
            if (debug) {
                notStrictEqual(this.$__events, null, "Remember to call \"this.__parent()\" in the constructor!");
            }

            var ev_name;

            //object check
            if (__typeof(event) === "object") {
                for (ev_name in event) {
                    this.addListener(ev_name, event[ev_name]);
                }
                return this;
            }

            // attach if its eventized!
            //if (__instanceof(fn, "Event")) {
            //    fn.__attach(this);
            //}

            if (!fn.$Event) {
                Eventize(fn);
            }

            fn.$Event.attach(event, this, (__typeof(times) === "null" ? -1 : times), !!internal);

            this.$__events[event] = this.$__events[event] || [];
            this.$__events[event].push(fn);


            if (this.$__eventskeys.indexOf(event) === -1) {
                this.$__eventskeys.push(event);
            }


            return this;
        },
        addOnceListener: function (event, fn) {
            return this.addListener(event, fn, 1, false);
        },
        hasListeners: function (event) {
            return this.$__events[event] ?
                    (this.$__events[event].length === 0 ? false : this.$__events[event].length)
                : false;
        },
        getListeners: function (event) {
            if (debug) {
                notStrictEqual(this.$__events, null, "Remember to call \"this.__parent()\" in the constructor!");
            }

            return this.$__events[event] ? array.clone(this.$__events[event]) : [];
        },
        fire: function (event, args, delay_ms) {
            if (debug) {
                notStrictEqual(this.$__events, null, "Remember to call \"this.__parent()\" in the constructor!");
            }

            var events,
                i,
                fn,
                max,
                check,
                key,
                ev_ast,
                ev_data;

            // dispatch pipe"d first
            if ("*" !== event && this.$__pipes.length) {
                for (i = 0; i < this.$__pipes.length; ++i) {
                    if (delay_ms !== undefined) {
                        this.$__pipes[i].fire(event, args, delay_ms);
                    } else if (args) {
                        this.$__pipes[i].fire(event, args);
                    } else {
                        this.$__pipes[i].fire(event);
                    }

                }
            }

            ev_ast = event.indexOf("*");

            if (ev_ast === -1 || "*" === event) {
                events = this.$__events[event];
            } else {
                check = new RegExp("^" + event.replace("*", "(.*)", "g"));
                events = [];

                i = this.$__eventskeys.length;
                while (i--) {
                    key = this.$__eventskeys[i];
                    if (check.test(key)) {
                        this.fire(key, args, delay_ms);
                    }
                }
            }

            if (!events || events.length === 0) {
                if (this.$__events["*"] && this.$__events["*"].length) {
                    return this.fire("*", args, delay_ms);
                }

                if (event === "error") {
                    //throw
                    throw new Error(args);
                }

                // nothing to work!
                return this;
            }


            max = events.length;
            for (i = 0; i < max; ++i) {
                fn = events[i];

                ev_data = fn.$Event.events[event];
                if (!ev_data) {
                    console.error("(node-class-events)", fn, fn.$Event, event);
                    console.error("(node-class-events)", fn, event);
                    process.exit();
                }

                if (debug) {
                    notStrictEqual(fn, undefined, "Did You remove a listener while looping!? then -> use Eventize.remove to do that!");
                }

                if (delay_ms !== undefined) {
                    args = array.ize(args);
                    fn.delay(delay_ms, fn/*this*/, args); // !!!<--
                } else {
                    ev_data.stop = false;

                    if (arguments.length === 1) {
                        //fn.apply(fn);
                        fn();
                    } else {
                        if (args && args.splice !== arraySplice) { //is array fast test...
                            args = array.ize(args);
                        }

                        if (!args) {
                            fn();
                        } else if (args.length === 1) {
                            fn(args[0]);
                        } else if (args.length === 2) {
                            fn(args[0], args[1]);
                        } else if (args.length === 3) {
                            fn(args[0], args[1], args[2]);
                        } else {
                            fn.apply(fn, /*this*/ args);
                        }
                    }
                }

                --ev_data.times;

                if (ev_data.times === 0) {
                    this.removeListener(event, fn);

                    if (max === 1) {
                        return this;
                    }

                    --i;
                    --max;
                }

                //stop ?
                if (ev_data.stop === true) {
                    return this;
                }
            }

            return this;
        },

        removeListener: function (event, fn) {
            var events = this.$__events[event],
                index;

            if (events && !(fn.$Event && fn.$Event[event] && fn.$Event[event].internal)) {
                index = events.indexOf(fn);

                if (index !== -1) {
                    events[index].$Event.detach();
                    events.splice(index, 1);
                    return true;
                }
            }
            return false;
        },

        removeAllListeners : function (events) {
            var event,
                fns,
                i;

            if (__typeof(events) === "object") {
                for (event in events) {
                    this.removeListener(event, events[event]);
                }
                return this;
            }

            for (event in this.$__events) {
                if (!(events && events !== event)) {
                    fns = this.$__events[event];
                    i = fns.length;

                    while (i--) {
                        if (fns[i] !== undefined) {
                            this.removeListener(event, fns[i]);
                        }
                    }
                }
            }
            return this;
        },
        pipeEvents: function (cls) {
            if (debug) {
                notStrictEqual(cls, this, "cannot pipe to \"myself\"");
            }

            //if (!__instanceof(cls, "Events")) {
            //    throw new Error("cls need to extends from Events");
            //}

            this.$__pipes.push(cls);
        },
        filterListeners: function (event, callback) {

        },
        setMaxListeners: function (n) {

        }
    });


    exports.Events.when = function (event, list, callback) {
        if (!list || list.length === 0) {
            callback();
            return;
        }

        var i,
            callback_nth = callback.after(list.length);

        for (i = 0; i < list.length; ++i) {
            list[i].addOnceListener(event, callback_nth);
        }
    };

    exports.Events.$transform = function (i) {
        return i.charAt(2).toLowerCase() + i.substring(3).replace(/[A-Z]/g, function (c) {
            return "-" + c.toLowerCase(c);
        });
    };

    exports.Events.$transform_snake_case = function (i) {
        return i.charAt(2).toLowerCase() + i.substring(3).replace(/[A-Z]/g, function (c) {
            return "_" + c.toLowerCase(c);
        });
    };

    exports.Events.$transformIntact = function (i) {
        return i.charAt(2).toLowerCase() + i.substring(3);
    };

    exports.Events.alias("addListener", "addEvent");
    exports.Events.alias("addListener", "on");

    exports.Events.alias("addOnceListener", "once");
    exports.Events.alias("addOnceListener", "addOnceEvent");

    exports.Events.alias("fire", "trigger");
    exports.Events.alias("fire", "emit");
    exports.Events.alias("fire", "fireEvent");

    exports.Events.alias("removeListener", "off");
    exports.Events.alias("removeAllListeners", "offAll");

    exports.Events.alias("getListeners", "listeners");
/*
    Object.defineProperty(Events.$$.descriptors[0], "value", {
        set: function() {
            throw new Error("wtf!!!");
        },
        get: function() {
            return null;
        }
    });
*/
    //exports.Events.hide(["$__events", "$__eventskeys", "$__pipes"]);

}("undefined" === typeof module ? NodeClass : module.exports, "undefined" === typeof module));
