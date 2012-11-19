(function (exports, browser) {
    "use strict";

    var Class = browser ? $.Class : require("./class.js").Class,
        __typeof = browser ? $.typeof : require("./class.js").typeof,
        __instanceof = browser ? $.instanceof : require("./class.js").instanceof;

    //
    // Events (Event Emitter)
    // support



    /**
     * @type Events
     */
    exports.Events = new Class("Events", {
        $__events : null,
        $__eventskeys : [],
        $__pipes: []
    });


    exports.Events.implements({
        __construct: function () {
            this.$__events = Object.create(null);
        },
        on_unhandled_event: function(fn) {
            return this.on("*", fn);
        },
        /**
         * @member Events
         */
        on : function (event, fn, internal, times) { //TODO: push on unshift
            // <debug>
            if (this.$__events === null) {
                throw new Error("Remember to call this.parent() in the constructor os the extended class!!!");
            }
            // </debug>

            var ev_name,
                i;

            //object check
            if (__typeof(event) == "object") {
                for (ev_name in event) {
                    this.on(ev_name, event[ev_name]);
                }
                return this;
            }

            // attach if its eventized!
            if (__instanceof(fn, "Event")) {
                fn.__attach(this);
            }

            this.$__events[event] = this.$__events[event] || [];
            this.$__events[event].push(fn);

            if (this.$__eventskeys.indexOf(event) === -1) {
                this.$__eventskeys.push(event);
            }

            if (internal) {
                fn.$__ev_internal = true;
            }

            fn.$__ev_times = __typeof(times) == "null" ? -1 : times;

            return this;
        },
        once: function (event, fn) {
            return this.on(event, fn, false, 0);
        },
        has_listener: function (event) {
            return this.$__events[event] ?
                    (this.$__events[event].length === 0 ? false : this.$__events[event].length)
                : false;
        },
        listeners: function (event) {
            // <debug>
            if (this.$__events === null) {
                throw new Error("Remember to call this.parent() in the constructor os the extended class!!!");
            }
            // </debug>
            return this.$__events[event] ? Array.clone(this.$__events[event]) : [];
        },
        emit : function (event, args, delay) {
            // <debug>
            if(this.$__events === null) {
                throw new Error("Remember to call this.parent() in the constructor os the extended class!!!");
            }
            // </debug>

            // dispatch pipe'd first
            if(this.$__pipes.length) {
                for(i = 0; i < this.$__pipes.length; ++i) {
                    if(delay) {
                        this.$__pipes[i].emit(event, args, delay);
                    } else if(args) {
                        this.$__pipes[i].emit(event, args);
                    } else {
                        this.$__pipes[i].emit(event);
                    }

                }
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
                if(events.length === 0) {
                    events = this.$__events["*"] || [];
                }
                event = false;
            }

            if (!events) {
                if(event === "error") {
                    //throw
                    throw new Error(args);
                }
                return this;
            }


            max = events.length;
            for (i = 0; i < max; ++i) {
                fn = events[i];

                if (delay) {
                    args = Array.ize(args);
                    fn.delay(delay, fn/*this*/, args); // !!!<--
                } else {
                    switch (arguments.length) {
                      case 1:
                        fn.apply(fn);
                        break;
                      case 2:
                        if(!args.splice) { //is array fast test...
                            args = Array.ize(args);
                        }
                        fn.apply(fn, /*this*/ args);
                    }
                }

                if (fn.$__ev_times === false || fn.$__ev_times === 0) {
                    this.off(event || fn.$__ev_name, fn);
                    if (max === 1) {
                        return this;
                    }
                    if (event !== false) { // if has a pattern events array is cloned and not affected by this.off!!
                        --i;
                        --max;
                    }
                } else if (fn.$__ev_times > 0) {
                    --fn.$__ev_times;
                }
                //stop ?
                if (this.$ev_stop === true) {
                    return this;
                }
            }

            return this;
        },

        off : function (event, fn) {
            var events = this.$__events[event],
                index;

            if (events && !fn.$__ev_internal) {
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

            if (__typeof(events) == "object") {
                for (event in events) {
                    this.off(event, events[event]);
                }
                return this;
            }

            for (event in this.$__events) {
                if (!(events && events != event)) {
                    fns = this.$__events[event];
                    i = fns.length;

                    while (i--) {
                        if (fns[i] !== undefined) {
                            this.off(event, fns[i]);
                        }
                    }
                }
            }
            return this;
        },
        pipe_events: function(cls) {
            // <debug>
            if(cls === this) {
                throw new Error("cannot pipe to 'myself'");
            }

            if(!__instanceof(cls, "Events")) {
                throw new Error("cls need to extends from Events");
            }


            // </debug>
            this.$__pipes.push(cls);
        }
    });

    exports.Events.alias("add_listener", "on");
    exports.Events.alias("remove_listener", "off");
    exports.Events.alias("get_listeners", "listeners");

    exports.Events.hide(["$__events", "$__eventskeys", "$__pipes"]);

}(typeof module == "undefined" ? $ : module.exports, typeof module == "undefined"));