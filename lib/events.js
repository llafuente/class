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
        $__eventskeys : []
    });


    exports.Events.implements({
        __construct: function () {
            this.$__events = Object.create(null);
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

            var ev_name;

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
                fn.$ev_internal = true;
            }

            fn.$ev_times = __typeof(times) == "null" ? -1 : times;

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
                events = this.$__events[event];
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
            var events = this.$__events[event],
                index;

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
        }
    });

}(typeof module == "undefined" ? $ : module.exports, typeof module == "undefined"));