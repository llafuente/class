(function (exports, browser) {
    "use strict";

    var Class = browser ? exports.Class : require("./class.js").Class,
        Events = browser ? exports.Events : require("./events.js").Events,
        __typeof = browser ? exports.Typeof : require("./class.js").Typeof,
        each = browser ? Object.each : require("./sugar.js").ObjectEach,
        ArrayIze = browser ? Array.ize : require("./sugar.js").ArrayIze,
        Animate,
        pow = Math.pow,
        sin = Math.sin,
        cos = Math.cos,
        acos = Math.acos,
        PI = Math.PI,
        abs = Math.abs,
        min = Math.min;

    /**
     *
     * credits - transitions from mootools
     */
    Animate = exports.Animate = new Class("Animate", {
        $__animation_interval: null,
        $__animating : false,
        $__animation_linking: "chain"
        //$__animation
    });

    Animate.Extends(Events);

    //set directly because we dont want to seal this variable
    Animate.Transitions = {
        linear: function (zero) {
            return zero;
        }
    };

    Animate.Static({
        /**
         *  mask values
         *  @i - integer
         *  @d - double
         *  @h - hexadecimal (not yet do not use it!)
         */
        setAnimationProterties: function (property, config) {
            if (__typeof(config.maskRegExp) !== "regexp") {
                config.maskCount = config.mask.match(/@/g).length;
                config.maskRegExp = new RegExp("^" +
                    config.mask
                        //escape!
                        .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")

                        .replace(/@d/g, '(\-?[0-9]*\.[0-9]*)') // digit at least one, % zero or one
                        .replace(/@i/g, '(\-?[0-9]*)') // digit at least one, % zero or one
                        //.replace(/@h/g, '([0-9A-Fa-f]{2})') // two: 0-9 and 0-f letter insensitive
                    + "$");
            }

            config.render = config.render || null;

            this.prototype.$__animation = this.prototype.$__animation || {};
            this.prototype.$__animation[property] = config;

            return config;
        },
        createTransition: function (name, transition, params) {
            params = ArrayIze(params);

            Animate.Transitions[name] = function (pos) {
                return transition(pos, params);
            };

            Animate.Transitions[name + "In"] = Animate.Transitions[name];

            Animate.Transitions[name + "Out"] = function (pos) {
                return 1 - transition(1 - pos, params);
            };

            Animate.Transitions[name + "InOut"] = function (pos) {
                return (pos <= 0.5 ? transition(2 * pos, params) : (2 - transition(2 * (1 - pos), params))) / 2;
            };

        }
    });

    each({
        Pow: function (p, x) {
            return pow(p, (x && x[0]) || 6);
        },
        Expo: function (p) {
            return pow(2, 8 * (p - 1));
        },
        Circ: function (p) {
            return 1 - sin(acos(p));
        },
        Sine: function (p) {
            return 1 - cos(p * PI / 2);
        },
        Back: function (p, x) {
            x = (x && x[0]) || 1.618;
            return pow(p, 2) * ((x + 1) * p - x);
        },
        Bounce: function (p) {
            var value, a, b;
            for (a = 0, b = 1; true; a += b, b /= 2) {
                if (p >= (7 - 4 * a) / 11) {
                    value = b * b - pow((11 - 6 * a - 11 * p) / 4, 2);
                    break;
                }
            }
            return value;
        },
        Elastic: function (p, x) {
            return pow(2, 10 * --p) * cos(20 * p * PI * ((x && x[0]) || 1) / 3);
        }
    },
        function (transition, i) {
            Animate.createTransition(i, transition);
        });


    ['Quad', 'Cubic', 'Quart', 'Quint'].forEach(function (transition, i) {
        Animate.createTransition(transition, function (p) {
            return pow(p, i + 2);
        });
    });


    function ksort(obj, sort_flags) {
        var keys = Object.keys(obj),
            sorter,
            ret = {},
            i;

        sort_flags = sort_flags || 'string';
        switch (sort_flags) {
        case 'string':
            sorter = function (a, b) {
                return a.strnatcmp(a, b);
            };
            break;
        case 'number':
            sorter = function (a, b) {
                return parseFloat(a) - parseFloat(b);
            };
            break;
        }

        keys.sort(sorter);
        for (i = 0; i < keys.length; i++) {
            ret[keys[i]] = obj[keys[i]];
        }
        return ret;
    }

    function rebuild_property(obj, property, from, to, factor) {
        var ret = obj.$__animation[property].mask,
            i = 0;

        // force return number if possible...
        if (ret === "@d" || ret === "@i") { //@X
            return ((to[i] - from[i]) * factor) + from[i];
        }

        while (ret.indexOf("@") !== -1) {
            ret = ret.replace(/@[difh]/, ((to[i] - from[i]) * factor) + from[i]);
            ++i;
        }
        return ret;
    }

    function normalize_animation_data(ovalues, obj) {
        var properties = [],
            ptime,
            ptime2,
            kproperty,
            frame,
            i,
            p,
            max,
            last_value;

        ovalues["0%"] = ovalues["0%"] || {};

        ovalues = ksort(ovalues, 'number');
        for (ptime in ovalues) {
            frame = ovalues[ptime];
            for (kproperty in frame) {
                if (properties.indexOf(kproperty) === -1) {
                    properties.push(kproperty);
                }
            }
        }

        max = properties.length;

        for (ptime in ovalues) {
            for (i = 0; i < max; ++i) {
                p = properties[i];

                if(obj.$__animation === undefined || !obj.$__animation.hasOwnProperty(p)) {
                    throw new Error("cannot find property[" + p + "] did you use <Class>.setAnimationProterties(" + p + ",?)");
                }

                if (!ovalues[ptime].hasOwnProperty(p)) {
                    //do some magic!
                    if (ptime === "0%") {
                        //at first... use the obj value!

                        ovalues[ptime][p] = obj[p];
                    } else if (ptime === "100%") {
                        //get the value before!
                        for (ptime2 in ovalues) {
                            if (ptime2 === ptime) {
                                break;
                            }
                            if (ovalues[ptime2].hasOwnProperty(p)) {
                                last_value = ovalues[ptime2][p];
                            }
                        }

                        ovalues[ptime][p] = last_value;
                    }
                }

                ovalues[ptime][p] = ("" + ovalues[ptime][p]).match(obj.$__animation[p].maskRegExp);
                // <debug>
                if (!ovalues[ptime][p] || ovalues[ptime][p].length === 0) {
                    throw new Error(ptime + "." + p + "cannot be parsed with the given mask or bad input!");
                }
                // </debug>

                // right now we dont support hexadecimal!
                ovalues[ptime][p] = ovalues[ptime][p].slice(1, 1 + obj.$__animation[p].maskCount).map(function (value) {
                    return parseFloat(value);
                });

            }
        }

        return ovalues;
    }

    Animate.Implements({
        /**
        * @param {Object} options
        *   {
        *       property: "<name>", // mandatory if value is a number or an array
        *       transition: Animate.Transitions.XXX, // default: Animate.Transitions.linear
        *       time: 1000, //mandatory
        *       fps: 12, // default: 12 (create the tick event periodically).
        *                // use false to generate your own tick event example: when using RequestAnimationFrame
        *       queue: false // default: false, in the todo list!
        *   }
        * @param {Mixed} value
        *     100: could be a number so it will be the end value
        *     [50,100]: could be a array, the first number will be the start and the second the
        *     {from: 50, to: 100}: could be an object with "from" & "to" keys
        *     {"0%": 50, "25%": 60, "100%": 100}: could be an object with a percentage in its keys (sorted is mandatory!)
        *     {"0%": {x:50, y: 100}, "25%": {x: 60}, "100%": {x: 100, y:0}}: could be an object with a percentage in its keys (sorted is mandatory!)
        */
        animate: function (options, value) {
            var chain;
            //console.log("animate", options, value, new Error().stack);
            if (this.isAnimated()) {
                switch(this.$__animation_linking) {
                case "ignore":
                    return Animate.IGNORE;

                case "chain":

                    chain = function() {
                        this.animate(options, value);
                        chain.$__ev_stop = true;
                    }.bind(this);

                    this.once("$__animation:end", chain);

                    this.emit("animation:chain", [options, value]);

                    return Animate.CHAIN;

                case "stop":
                    this.stopAnimation();

                    return Animate.STOP;
                case "cancel":
                    this.stopAnimation();
                    // and continue!
                }
            }

            this.$__animating = true;

            var svalue = __typeof(value),
                start = +(new Date),
                current = start,
                animation,
                kvalue,
                fvalue,
                i,
                max,
                ovalue = {
                    "0%" : {},
                    "100%" : {}
                };

            // <debug>
            if (__typeof(options) !== "object") {
                throw new Error("options must be an object!");
            }
            if (__typeof(options.time) !== "number") {
                throw new Error("options.time must be a number!");
            }
            if (["number", "array", "object"].indexOf(svalue) === -1) {
                throw new Error("value must be a number, array or object!");
            }
            if (["number", "array"].indexOf(svalue) !== -1 && __typeof(options.property) !== "string") {
                throw new Error("options.property must be a string if value is [number|array]");
            }
            // </debug>


            // defaults
            animation = {
                property : options.property,
                time : options.time,
                transition : options.transition || Animate.Transitions.linear,
                queue : options.queue || false,
                properties: null,
                getValue: null,
                update: null
            };

            // normalize value input to internal format
            switch (svalue) {
            case "array":
                ovalue["0%"][options.property] = value[0];
                ovalue["100%"][options.property] = value[1];
                break;
            case "number":
                ovalue["0%"][options.property] = this[options.property];
                ovalue["100%"][options.property] = value;
                break;
            case "object":
                if (value.hasOwnProperty("from") && value.hasOwnProperty("to")) {
                    ovalue["0%"][options.property] = value.from;
                    ovalue["100%"][options.property] = value.to;
                } else {
                    ovalue = value;
                }
                break;
            }
            // <debug>
            /* !ovalue.hasOwnProperty("0%") || */
            if (!ovalue.hasOwnProperty("100%")) {
                throw new Error("values as object must have 0%-100% or from/to");
            }
            // </debug>

            ovalue = normalize_animation_data(ovalue, this);


            animation.properties = Object.keys(ovalue["0%"]);

            fvalue = Object.keys(ovalue);
            kvalue = Object.keys(ovalue);
            max = kvalue.length;
            for (i = 0; i < max; ++i) {
                fvalue[i] = parseFloat(kvalue[i], 10) / 100;
            }
            fvalue.sort();

            animation.getValue = function (factor, property) {
                var i,
                    max = kvalue.length,
                    rfactor,
                    found = false;

                factor = abs(factor);

                for (i = 0; i < max; ++i) {
                    if (fvalue[i] <= factor) {

                        if (i === max - 1) {
                            //last element
                            found = true;
                            --i;
                        }

                        if (fvalue[i + 1] > factor) {
                            found = true;
                        }

                        if (found === true) {
                            //next one is greater
                            rfactor = (factor - fvalue[i]) / (fvalue[i + 1] - fvalue[i]);

                            if (factor === 1) {
                                return rebuild_property(this, property, ovalue["100%"][property], ovalue["100%"][property], 1);
                            }

                            return rebuild_property(this, property, ovalue[kvalue[i]][property], ovalue[kvalue[i + 1]][property], factor);
                        }
                    }
                }
            }.bind(this);

            animation.update = function (delta) {
                var now = +(new Date),
                    elapsed_total = now - start,
                    tfactor = min(1, elapsed_total / animation.time),
                    factor = animation.transition(tfactor),
                    i,
                    max,
                    property;

                if (tfactor === 1) {
                    factor = 1;
                }

                current = now;

                max = animation.properties.length;
                for (i = 0; i < max; ++i) {
                    property = animation.properties[i];
                    if (this.$__animation[property].render) {
                        this.$__animation[property].render(this, property, animation.getValue(factor, property), this.$__animation[property].type);
                    } else {
                        this[property] = animation.getValue(factor, property);
                    }
                }

                if (tfactor === 1) {
                    this.stopAnimation(animation);

                    // hacky pretty internal
                    // if you need to remove while looping, use Eventize(<your function>) and later <your function>.remove()
                    animation.update.$__ev_times = false;

                } else {
                    this.emit("animation:update", [this, animation]);
                }
            }.bind(this);

            animation.update.animation = animation;


            max = animation.properties.length;
            for (i = 0; i < max; ++i) {
                if (this.$__animation[animation.properties[i]].render) {
                    this.$__animation[animation.properties[i]].render(this, animation.properties[i], animation.getValue(0, animation.properties[i]), this.$__animation[animation.properties[i]].type);
                } else {
                    this[animation.properties[i]] = animation.getValue(0, animation.properties[i]);
                }
            }

            this.emit("animation:start", [this, animation]);

            if (options.fps) {
                options.fps = Math.floor(1000 / options.fps) || 85;
                this.$__animation_interval = function () {
                    this.emit("tick", []);
                }.periodical(options.fps, this);
            }

            this.on("tick", animation.update);

            return Animate.ANIMATING;
        },
        isAnimated: function () {
            return this.$__animating;
        },
        stopAnimation: function (animation) {
            if(this.$__animating === true) {
                animation = animation || {};

                if (this.$__animation_interval) {
                    clearInterval(this.$__animation_interval);
                    this.$__animation_interval = null;
                }

                this.$__animating = false;

                //animation end!
                this.emit("animation:end", [this, animation]);
                this.emit("$__animation:end", [this, animation]); // for internal uses

                return true;
            }
            return false;
        },
        // cancel
        // chain
        // stop
        setAnimationLink: function (link) {
            // <debug>
            if ([Animate.ANIMATING, Animate.CHAIN, Animate.STOP, Animate.IGNORE, Animate.CANCEL].indexOf(link) === -1) {
                throw new Error("invalid paramter: link must be [ignore, chain, stop]");
            }
            // </debug>
            // todo ?
            this.$__animation_linking = link;
        }
    });

    Animate.ANIMATING = "animating";
    Animate.CHAIN = "chain";
    Animate.STOP = "stop";
    Animate.IGNORE = "ignore";
    Animate.CANCEL = "cancel";

}(typeof module === "undefined" ? NodeClass : module.exports, typeof module === "undefined"));
