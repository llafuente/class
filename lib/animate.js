(function (exports, browser) {
    "use strict";

    var Class = browser ? $.Class : require("./class.js").Class,
        Events = browser ? $.Events : require("./events.js").Events,
        typeOf = browser ? $.typeof : require("./class.js").typeof,
        Animate;

    Animate = exports.Animate = Class("Animate", {
        __animation: {}
    });

    Animate.extends(Events);

    //set directly because we dont want to seal this variable
    Animate.Transitions = {
        linear: function (zero) {
            return zero;
        }
    };

    Animate.static({
        setAnimationProterties: function (property, config) {
            this.prototype.__animation[property] = config;
        },
        createTransition: function (name, transition, params) {
            params = Array.from(params);

            Animate.Transitions[name] = function (pos) {
                transition(pos, params);
            };
            Animate.Transitions[name + "InOut"] = function (pos) {
                return (pos <= 0.5 ? transition(2 * pos, params) : (2 - transition(2 * (1 - pos), params))) / 2;
            };
            Animate.Transitions[name + "Out"] = function (pos) {
                return 1 - transition(1 - pos, params);
            };

            Animate.Transitions[name + "In"] = Animate.Transitions[name];
        }
    });

    Object.each({
        Pow: function (p, x) {
            return Math.pow(p, x && x[0] || 6);
        },
        Expo: function (p) {
            return Math.pow(2, 8 * (p - 1));
        },
        Circ: function (p) {
            return 1 - Math.sin(Math.acos(p));
        },
        Sine: function (p) {
            return 1 - Math.cos(p * Math.PI / 2);
        },
        Back: function (p, x) {
            x = x && x[0] || 1.618;
            return Math.pow(p, 2) * ((x + 1) * p - x);
        },
        Bounce: function (p) {
            var value, a, b;
            for (a = 0, b = 1; true; a += b, b /= 2) {
                if (p >= (7 - 4 * a) / 11) {
                    value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
                    break;
                }
            }
            return value;
        },
        Elastic: function (p, x) {
            return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x && x[0] || 1) / 3);
        }
    },
        function (transition, i) {
            Animate.createTransition(i, transition);
        });


    ['Quad', 'Cubic', 'Quart', 'Quint'].forEach(function (transition, i) {
        Animate.createTransition(transition, function (p) {
            return Math.pow(p, i + 2);
        });
    });


    function normalize_animation_data(obj, ovalues) {
        var properties = [],
        ptime,
        ptime2,
        kproperty,
        frame,
        i,
        max,
        last_value;

        for(ptime in ovalues) {
            frame = ovalues[ptime];
            for(kproperty in frame) {
                if(properties.indexOf(kproperty) === -1) {
                    properties.push(kproperty);
                }
            }
        }

        max = properties.length;

        for(ptime in ovalues) {
            for(i=0; i < max; ++i) {
                if (!ovalues[ptime].hasOwnProperty(properties[i])) {
                    //do some magic!
                    if(ptime == "0%") {
                        //at first... use the obj value!
                        ovalues[ptime][properties[i]] = obj[properties[i]];
                    } else if(ptime == "100%") {
                        //get the value before!
                        for(ptime2 in ovalues) {
                            if(ptime2 == ptime) {
                                break;
                            }
                            if(ovalues[ptime2].hasOwnProperty(properties[i])) {
                                last_value = ovalues[ptime2][properties[i]];
                            }
                        }

                        ovalues[ptime][properties[i]] = last_value;
                    }
                }

            }
        }

        return properties;
    }

    Animate.implements({
        /**
        * @param {Object} options
        *   {
        *       property: "<name>", //mandatory
        *       transition: Animate.Transitions.XXX, // default: Animate.Transitions.linear
        *       time: 1000, //mandatory
        *       fps: 12, //default: 12
        *       queue: false // default: false
        *   }
        * @param {Mixed} value
        *     100: could be a number so it will be the end value
        *     [50,100]: could be a array, the first number will be the start and the second the
        *     {from: 50, to: 100}: could be an object with "from" & "to" keys
        *     {"0%": 50, "100%": 100}: could be an object with a percentage in its keys (ORDERED!)
        */
        animate: function (options, value) {
            var svalue = typeOf(value),
                start = +(new Date),
                current = start,
                update_interval,
                animation,
                kvalue,
                fvalue,
                i,
                max,
                ovalue = {
                    "0%" : {},
                    "100%" : {},
                };

            // <debug>
            if (typeOf(options) != "object") {
                throw new Error("options must be an object!");
            }
            if (typeOf(options.time) != "number") {
                throw new Error("options.time must be a number!");
            }
            if (["number", "array", "object"].indexOf(svalue) === -1) {
                throw new Error("value must be a number, array or object!");
            }
            if (["number", "array"].indexOf(svalue) === -1 && typeOf(options.property) != "string") {
                throw new Error("options.property must be a string!");
            }
            // </debug>


            // defaults
            animation = {
                property : options.property,
                time : options.time,
                transition : options.transition || Animate.Transitions.linear,
                fps : Math.round(1000 / options.fps) || 85, // 1000 / 12
                queue : options.queue || false
            };

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
            }
            // <debug>
            if (!ovalue.hasOwnProperty("0%") || !ovalue.hasOwnProperty("100%")) {
                throw new Error("values as object must have 0%-100% or from/to");
            }
            // </debug>

            animation.properties = normalize_animation_data(this, ovalue);

            fvalue = Object.keys(ovalue);
            kvalue = Object.keys(ovalue);
            max = kvalue.length;
            for (i = 0; i < max; ++i) {
                fvalue[i] = parseFloat(kvalue[i]) / 100;
            }

            console.log("key values to test", kvalue, fvalue);

            animation.getValue = function (factor, property) {
                var i,
                    max = kvalue.length,
                    rfactor,
                    found = false;

                for (i = 0; i < max; ++i) {
                    if (fvalue[i] <= factor) {

                        if (i === max - 1) {
                            //last element
                            console.log("last element");
                            found = true;
                            --i;
                        }

                        if (fvalue[i + 1] > factor) {
                            found = true;
                        }
                        if(found === true) {
                            //next one is greater
                            rfactor = (factor - fvalue[i]) / (fvalue[i + 1] - fvalue[i]);
                            console.log("in element", rfactor, kvalue[i], kvalue[i + 1], ovalue[property]);

                            return ((ovalue[kvalue[i + 1]][property] - ovalue[kvalue[i]][property]) * factor) + ovalue[kvalue[i]][property];
                        }
                    }
                }
                throw new Error("unreachable");
            }

            console.log(animation);

            function update() {
                var now = +(new Date),
                    elapsed = now - current,
                    elapsed_total = now - start,
                    tfactor = Math.min(1, elapsed_total / animation.time),
                    factor = animation.transition(tfactor),
                    i,
                    max;

                current = now;

                max = animation.properties.length;
                for(i = 0; i < max; ++i) {
                    this[animation.properties[i]] = animation.getValue(factor, animation.properties[i]);
                    console.log("update", factor, this[animation.properties[i    ]]);
                }


                if (tfactor === 1) {
                    clearInterval(update_interval);
                    //animation end!
                    this.emit("animation:end", [animation]);
                } else {
                    this.emit("animation:update", [animation]);
                }
            }

            max = animation.properties.length;
            for(i = 0; i < max; ++i) {
                this[animation.properties[i]] = ovalue["0%"][animation.properties[i]];
            }
            this.emit("animation:start", [animation]);
            update_interval = update.periodical(animation.fps, this);

        },
        morph: function (options) {
        }
    });

}(typeof module == "undefined" ? $ : module.exports, typeof module == "undefined"));