(function (exports, browser) {
    "use strict";

    var Class = browser ? exports.Class : require("./class.js")["class"],
        __typeof = browser ? exports.__typeof : require("./class.js").__typeof,
        notStrictEqual = require('assert').notStrictEqual,
        strictEqual = require('assert').strictEqual,
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
        $__events : null,
        $__eventskeys : [],
        $__pipes: [],

        initialize: function (options) {
            var i,
                k;

            this.$__events = Object.create(null);

            if (options) {
                if ('[object Object]' === (options.toString && options.toString())) {
                    for (i in options) {
                        // ultra-fast check for onUcase keys
                        if (i.length > 3 && i[0] === "o" && i[1] === "n" && i[2] === i[2].toUpperCase()) {
                            if (debug) {
                                strictEqual(typeof options[i], "function", i + " must be a function");
                            }

                            k = Events.$transform(i);

                            this.addEvent(k, options[i]);
                        }
                    }
                }
            }

            // i leave it here, it's very usefull to know if you init correctly your clases
            // and also the order
            // console.log("events", __typeof(this));
        },
        on_unhandled_event: function (fn) {
            return this.addEvent("*", fn);
        },
        /**
         * @member Events
         */
        addEvent: function (event, fn, internal, times) { //TODO: push on unshift
            if (debug) {
                notStrictEqual(this.$__events, null, "Remember to call 'this.__parent()' in the constructor!");
            }

            var ev_name,
                i;

            //object check
            if (__typeof(event) === "object") {
                for (ev_name in event) {
                    this.addEvent(ev_name, event[ev_name]);
                }
                return this;
            }

            // attach if its eventized!
            //if (__instanceof(fn, "Event")) {
            //    fn.__attach(this);
            //}

            this.$__events[event] = this.$__events[event] || [];
            this.$__events[event].push(fn);

            if (this.$__eventskeys.indexOf(event) === -1) {
                this.$__eventskeys.push(event);
            }

            if (internal) {
                fn.$__ev_internal = true;
            }

            fn.$__ev_times = __typeof(times) === "null" ? -1 : times;

            return this;
        },
        addOnceEvent: function (event, fn) {
            return this.addEvent(event, fn, false, 0);
        },
        hasListeners: function (event) {
            return this.$__events[event] ?
                    (this.$__events[event].length === 0 ? false : this.$__events[event].length)
                : false;
        },
        getListeners: function (event) {
            if (debug) {
                notStrictEqual(this.$__events, null, "Remember to call 'this.__parent()' in the constructor!");
            }

            return this.$__events[event] ? Array.clone(this.$__events[event]) : [];
        },
        fireEvent: function (event, args, delay_ms) {
            if (debug) {
                notStrictEqual(this.$__events, null, "Remember to call 'this.__parent()' in the constructor!");
            }

            var events,
                i,
                j,
                jmax,
                aux,
                fn,
                max,
                check,
                key;

            // dispatch pipe'd first
            if (this.$__pipes.length) {
                for (i = 0; i < this.$__pipes.length; ++i) {
                    if (delay_ms !== undefined) {
                        this.$__pipes[i].fireEvent(event, args, delay_ms);
                    } else if (args) {
                        this.$__pipes[i].fireEvent(event, args);
                    } else {
                        this.$__pipes[i].fireEvent(event);
                    }

                }
            }


            if (event.indexOf("*") === -1) {
                events = this.$__events[event] || this.$__events["*"];
            } else {
                check = new RegExp("^" + event.replace("*", "(.*)", "g"));
                events = [];

                i = this.$__eventskeys.length;
                while (i--) {
                    key = this.$__eventskeys[i];
                    if (check.test(key)) {
                        aux = this.$__events[key];

                        jmax = aux.length;
                        for (j = 0; j < jmax; ++j) {
                            aux[j].$__ev_name = key;
                            events.push(aux[j]);
                        }
                    }
                }
                if (events.length === 0) {
                    events = this.$__events["*"] || [];
                }
                event = false;
            }

            if (!events) {
                if (event === "error") {
                    //throw
                    throw new Error(args);
                }
                return this;
            }


            max = events.length;
            for (i = 0; i < max; ++i) {
                fn = events[i];

                if (debug) {
                    notStrictEqual(fn, undefined, "Did You remove a listener while looping!? then -> use Eventize.remove to do that!");
                }

                if (delay_ms !== undefined) {
                    args = Array.ize(args);
                    fn.delay(delay_ms, fn/*this*/, args); // !!!<--
                } else {
                    if (arguments.length === 1) {
                        //fn.apply(fn);
                        fn();
                    } else {
                        if (args.splice !== arraySplice) { //is array fast test...
                            args = Array.ize(args);
                        }

                        if (args.length === 1) {
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

                if (fn.$__ev_times === false || fn.$__ev_times === 0) {
                    this.removeListener(event || fn.$__ev_name, fn);
                    if (max === 1) {
                        return this;
                    }
                    if (event !== false) { // if has a pattern events array is cloned and not affected by this.removeListener!!
                        --i;
                        --max;
                    }
                } else if (fn.$__ev_times > 0) {
                    --fn.$__ev_times;
                }
                //stop ?
                if (this.$__ev_stop === true) {
                    return this;
                }
            }

            return this;
        },

        removeListener: function (event, fn) {
            var events = this.$__events[event],
                index;

            if (events && !fn.$__ev_internal) {
                index = events.indexOf(fn);

                if (index !== -1) {
                    if (events[index].__detach) {
                        events[index].__detach();
                    }
                    events.splice(index, 1);
                    return true;
                }
            }
            return false;
        },

        remove_listeners : function (events) {
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
        pipe_events: function (cls) {
            if (debug) {
                notStrictEqual(cls, this, "cannot pipe to 'myself'");
            }

            //if (!__instanceof(cls, "Events")) {
            //    throw new Error("cls need to extends from Events");
            //}

            this.$__pipes.push(cls);
        },
        filterListeners: function (event, callback) {

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
            list[i].addOnceEvent(event, callback_nth);
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

    exports.Events.alias("addEvent", "on");
    exports.Events.alias("addEvent", "addListener");

    exports.Events.alias("addOnceEvent", "once");
    exports.Events.alias("addOnceEvent", "addOnceListener");
    exports.Events.alias("fireEvent", "trigger");
    exports.Events.alias("fireEvent", "emit");

    exports.Events.alias("removeListener", "off");
    exports.Events.alias("getListeners", "listeners");

    //exports.Events.hide(["$__events", "$__eventskeys", "$__pipes"]);

}("undefined" === typeof module ? NodeClass : module.exports, "undefined" === typeof module));
