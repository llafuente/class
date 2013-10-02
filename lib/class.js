(function (exports, browser) {
    "use strict";

    var process_data = browser ? {id: 0} : process,
        defineProperty = Object.defineProperty,
        hasOwnProperty = Object.hasOwnProperty,
        seal = Object.seal,
        create = Object.create,
        merge = Object.merge,
        trace = console.trace || function () {},
        slice = Array.prototype.slice,
        ___program_start = new Date(),
        ___delta = ___program_start.getTime(),
        log_levels = {},
        __verbose = function () {}, // console.log
        //__verbose =  console.log,
        __warning = function () {}, // console.log
        class_names = [],
        //ouput
        __assert_arg,
        __typeof,
        __instanceof,
        __clone,
        Classize,
        Class,
        log_level = 4,
        log = null,
        sugar;

    if (!browser) {
        //in the browser you should include extends_js.js before class.js
        sugar = require("./sugar.js");
    }

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
    __assert_arg = function (val, type, position) {
        var thr = false;
        if (__typeof(type) === "array") {
            if (type.indexOf(__typeof(val)) === -1) {
                thr = true;
            }
        } else if (__typeof(val) !== type) {
            thr = true;
        }
        if (thr) {
            trace(); // to debug in browser it's better to trace... so trace!

            throw new Error("argument[" + (position || "?") + "] must be " + type + "and is [" +  __typeof(val) +  "] -> " + val);
        }
    };

    // </debug>

    /**
     * get the type of val. note: undefined/nan is null
     *
     * @param {mixed}
     *            val
     * @returns {String}
     */
    __typeof = function (val) {
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

        // Class instanced
        if (val.$name !== undefined) {
            return val.$name;
        }
        // Class prototyping
        if (val.prototype && val.prototype.$name !== undefined) {
            return val.prototype.$name;
        }

        var type = (typeof val).toLowerCase();

        if (type === "object") {
            if (typeof val.length === "number") {
                if (val instanceof Array) {
                    return "array";
                }

                if (hasOwnProperty.call(val, "callee")) {
                    return "arguments";
                }

            } else if (val instanceof Date) {
                return "date";
            } else if (val instanceof RegExp) {
                return "regexp";
            }
        }

        if (type === "number" && isNaN(val)) {
            return "null";
        }

        return type;
    };

    /**
     * return is cls is instance of cls_name. To use it you must use the Class
     * constructor.
     *
     * @param {Mixed}
     *            cls
     * @param {String}
     *            cls_name
     * @returns {Boolean}
     */
    __instanceof = function (cls, cls_name) {
        if (!cls || !cls_name) {
            return false;
        }

        var name = (cls.$name || (cls.prototype ? (cls.prototype.$name || null) : null)),
            $inheritance;

        if (name === null) {
            return false;
        }

        if (name === cls_name) {
            return true;
        }

        $inheritance = (cls.$inheritance || (cls.prototype && cls.prototype.$inheritance ? (cls.prototype.$inheritance || null) : null));

        if ($inheritance === null) {
            return false;
        }

        return $inheritance.indexOf(cls_name) !== -1;
    };

    /**
     * clone everything excepts functions!
     *
     * @params {Object} to
     * @params {Object} from
     * @params {Boolean} functions
     */
    __clone = function (obj, recursive) {
        recursive = recursive || true;

        var i,
            clone,
            cloned,
            key;

        switch (__typeof(obj)) {
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
                    clone[i] = __clone(obj[i], recursive);
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
                    cloned[key] = __clone(obj[key], recursive);
                } else {
                    cloned[key] = obj[key];
                }
            }

            return cloned;
        case "function":
            return obj;
        case "regexp":
            return new RegExp(obj.source);
        case "date":
            return new Date(obj);
        default:
            if (__instanceof(obj, "Class")) {
                return obj.serialize();
            }
            throw new Error("type[" + __typeof(obj) + "] cannot be cloned");
        }
    };

    /**
     * options naming convetion, not frozen.
     * XXXX normal var
     * _XXX use with caution
     * __XX private cannot be set in the construtor, and serialized if send true
    */
    // need to be tested!!!
    Classize = function (cls_name, cls) {
        var ret = new Class(cls_name, {}),
            key;

        for (key in ret.prototype) {
            cls.prototype[key] = ret.prototype[key];
        }

        ret.prototype = cls.prototype;

        return ret;
    };

    Class = function (name, properties, methods) {
        // <debug>
        __assert_arg(name, "string", 1);
        __assert_arg(properties, ["null", "object"], 2);
        __assert_arg(methods, ["null", "object"], 3);

        if (!(this instanceof Class)) {
            throw new Error("new operator is missing before Class");
        }
        // </debug>

        //<security>
        if (class_names.indexOf(name) !== -1) {
            throw new Error("Class name already exists: " + name + "@" + class_names.join(","));
        }
        class_names.push(name);
        //</security>

        var $self, // this points to the base object, used to check some
                   // prototype things
            $inheritance = ["Class", name],
            $properties = [],
            $data_descriptors = {},
            $methods = [],
            $abstract_methods = [],
            $final_methods = [],
            $static_methods = [],
            $seal_instances = false,
            $autoset = true,
            $childs = [];

        // constructor
        $self = function (options) {
            // <debug>

            // abstract_methods check
            var i,
                max,
                found,
                opt,
                k,
                descriptor,
                autoset_prop;

            // check abstract methods
            max = $abstract_methods.length;
/*
            console.log("******************");
            console.log(name);
            console.log($abstract_methods);
            console.log($methods);
            console.log($data_descriptors);
*/
            for (i = 0; i < max; ++i) {
                if ($methods.indexOf($abstract_methods[i]) === -1) {
                    throw new Error("[" + name + "] abstract_methods class missing method: " + $abstract_methods[i]);
                }
            }

            if (this.$name === undefined) {
                console.log("**", this);
                console.log(new Error().stack);

                process.exit();
                throw new Error("[" + name + "] remember to use new before the name class!");
            }
            // </debug>

            // write properties to the instance, if you do not do that console.log do not display anything
            // also need to apply custom descriptor properties :)
            max = $properties.length;
            for (i = 0; i < max; ++i) {
                k = $properties[i];
                autoset_prop = $autoset && options && options[k] !== undefined;

                descriptor = __clone($data_descriptors[k]);

                if (autoset_prop) {

                    if (descriptor.value !== undefined) { // value
                        switch (__typeof(descriptor.value)) {
                        case "object":
                            descriptor.value = merge(descriptor.value, options[k]); // maybe clone
                            break;
                        default:
                            descriptor.value = options[k]; // maybe clone
                            break;
                        }
                        defineProperty(this, $properties[i], descriptor);
                    } else { // settter/getter
                        descriptor.value = options[k];
                        defineProperty(this, $properties[i], descriptor);
                    }
                } else {
                    defineProperty(this, $properties[i], descriptor);
                }
            }

            // when the first object is created we should close the class so no
            // futher implement/extend ?
            // ??
            // delete $self.$prototyping;

            // constructor
            if (this.__construct) {
                this.__construct.apply(this, arguments);
            }

            // define parent, if the class is sealed we cannot modify anything in the future
            defineProperty(this, "parent", {
                value: null,
                writable : true,
                enumerable : false,
                configurable : false
            });

            // at the end, seal the object if required
            if ($seal_instances) {
                seal(this);
            }

            return this;
        };


        // give it a proper name!
        $self.prototype.constructor.name = name;

        // clean prototype, speed up? -> no information on traces
        // $self.prototype = create(null);
        //$self.prototype = {};


        // <debug>
        $self.__proto = $self.prototype;
        // </debug>

        defineProperty($self.prototype, "$name", {
            get: function () {
                return name;
            },
            enumerable : false, // this should be true ?
            configurable : false
        });

        defineProperty($self.prototype, "$inheritance", {
            get: function () {
                return $inheritance;
            },
            enumerable : false,
            configurable : false
        });


        // this way we can point to the Class instead the instanced
        defineProperty($self.prototype, "$myself", {
            value: $self,
            writable : false,
            enumerable : false,
            configurable : false
        });

        /**
        * serialization method
        * only serialize properties that are defined
        * @note: exports hidden properties
        * @note: private properties starts with "__" or "$_"
        */
        defineProperty($self.prototype, "serialize", {
            value: function (export_private) {
                // <debug>
                __assert_arg(export_private, ["null", "boolean"], 1);
                // </debug>

                export_private = export_private === true;
                var i,
                    max = $properties.length,
                    proto = $self.prototype,
                    opt,
                    ret = {},
                    start_width;

                __verbose("cloning properties", i, max);
                for (i = 0; i < max; ++i) {
                    opt = $properties[i];
                    start_width = opt.substring(0, 2);

                    //always ignore $_
                    if (start_width !== "$_" && !(export_private === false && (start_width === "__"))) {
                        ret[opt] = __clone(this[opt], true);
                    }
                }

                return ret;
            },
            writable : false,
            enumerable : false,
            configurable : false
        });
        /**
        * unserialize properties
        * @note: private properties starts with "__" or "$_"
        */
        defineProperty($self.prototype, "unserialize", {
            value: function (ret, import_private) {
                // <debug>
                __assert_arg(ret, ["object", "null"], 1);
                __assert_arg(import_private, ["null", "boolean"], 2);
                // </debug>

                import_private = import_private  === true;
                var i,
                    max = $properties.length,
                    opt,
                    start_width;

                __verbose("unserialize properties", i, max);
                for (i = 0; i < max; ++i) {
                    opt = $properties[i];

                    start_width = opt.substring(0, 2);

                    //always ignore $_
                    if ((!import_private && start_width === "__") || start_width === "$_" || ret[opt] === undefined) {
                        continue; //ignore property
                    }

                    this[opt] = ret[opt];
                }

                return this;
            },
            writable : false,
            enumerable : false,
            configurable : false
        });

        /**
         * Disable autoset
         * @note there is no reverse method for security reasons
         */
        $self.disable_autoset = function () {
            $autoset = false;

            return this;
        };

        $self.__set = function (proto, p_name, p_value, descriptor, must_be_function) {
            var target = this,
                stype = __typeof(p_value),
                setter = descriptor.set || descriptor.get,
                i,
                is_function = stype === "function";

            must_be_function = must_be_function === true;

            if (proto) {
                target = target.prototype;
            }
            //<debug>
            if (p_name === "initialize") {
                throw new Error("initialize is a forbidden function name use: __construct");
            }

            //warn ?
            if (must_be_function && !is_function) {
                __warning(p_name + " is not a function is ", stype);
            }
            if ($final_methods.indexOf(p_name) !== -1) {
                throw new Error(p_name + " is final, cannot be implemented/extended/*");
            }
            // if abstract must have the same arguments count
            if (must_be_function && $abstract_methods.indexOf(p_name) !== -1 && target[p_name] && target[p_name].length !== p_value.length) {
                console.log(target, target[p_name], target[p_name].length);
                console.log(p_value.length);
                console.log(p_value.toString());
                process.exit();
                throw new Error(p_name + " is abstract and the parameter count is different");
            }
            //</debug>


            proto = proto || false;
            descriptor._final = descriptor._final === true;
            descriptor._abstract = descriptor._abstract === true;
            descriptor.writable = descriptor.writable === true;
            descriptor.enumerable = descriptor.enumerable === true;
            descriptor.configurable = descriptor.configurable === true;


            if ("powerup" === p_name) {
                console.log(name, "$self.__set", arguments);
            }

            if (proto) {
                if (descriptor._abstract) {
                    $abstract_methods.push(p_name);
                } else if(is_function) {
                    $methods.push(p_name);
                }

                if (descriptor._final) {
                    $final_methods.push(p_name);
                }
            } else if(is_function) {
                $static_methods.push(p_name);
            }

            if (p_value !== undefined) {

                // set descriptor.value if needed
                if (!setter) {
                    // allow parent
                    if (is_function && target[p_name] !== undefined) {
                        //parent wrap!
                        descriptor.value = (function () {
                            var parent = target[p_name],
                                swap_parent;

                            return function () {
                                swap_parent = this.parent;
                                this.parent = parent;
                                __verbose("set parent, and save the old one", swap_parent, p_value, p_name);
                                var ret = p_value.apply(this, arguments);
                                __verbose("release parent, and restore the old one");
                                if (swap_parent === undefined) {
                                    delete this.parent;
                                } else {
                                    this.parent = swap_parent;
                                }
                                return ret;
                            };
                        }());
                    } else {
                        descriptor.value = p_value;
                    }
                }

                if (!is_function) {
                    $data_descriptors[p_name] = descriptor;
                    $properties.push(p_name);
                }

                defineProperty(target, p_name, descriptor);
            }

            for (i = 0; i < $childs.length; ++i) {
                $childs[i].__set(proto, p_name, p_value, descriptor, must_be_function);
            }
        };

        /**
         * Implements given methods in this
         * The methods goes to the prototype so you can implement and all instances get affected
         * @param {Object} methods
         * @param {Boolean} finale
         */
        $self.Implements = function (methods, finale) {
            // <debug>
            __assert_arg(methods, "object", 1);
            __assert_arg(finale, ["null", "boolean"], 2);
            // </debug>

            __verbose("implements = ", name, methods, finale);
            finale = finale === true;

            var fn_name,
                source = null;

            if (__instanceof(methods, "Class")) {
                source = methods.prototype;
            } else {
                source = methods;
            }

            // object
            for (fn_name in source) {
                $self.__set(true, fn_name, source[fn_name], {
                    _final: finale,
                    writable: true,
                    configurable: true
                }, true);
            }

            return this;
        };
        /**
         * add functions that cannot be extended
         *
         * @param {Object} methods
         */
        $self.Final = function (methods) {
            return this.Implements(methods, true);
        };

        /**
         * Implements given methods in a static way, it not affect the prototype
         * to call the functions:
         *     <class_name>.<function>(<params>)
         * @param {Object} methods
         * @param {Boolean} finale
         */
        $self.Static = function (methods) {
            // <debug>
            __assert_arg(methods, "object", 1);
            // </debug>

            var i = null,
                target = this,
                stype;

            // object
            for (i in methods) {
                $self.__set(false, i, methods[i], {
                    writable : false,
                    enumerable : true,
                    configurable : false
                }, false);
            }
        };
        /**
         * Add abstract methods, once it's done this class cannot be instanced
         * Note:
         * @param Object methods {function_name: array_with_parameter or Function}
         */
        $self.Abstract = function (methods) {
            // <debug>
            __assert_arg(methods, "object", 1);
            // </debug>

            var i;

            if (methods instanceof Array) {
                for (i in methods) {
                    $self.__set(true, methods[i], null, {
                        _abstract: true,
                        writable : false,
                        enumerable : true,
                        configurable : false
                    }, true);
                }
            } else {
                for (i in methods) {
                    $self.__set(true, i, methods[i], {
                        _abstract: true,
                        writable : false,
                        enumerable : true,
                        configurable : false
                    }, true);
                }
            }


            return this;
        };
        /**
         * Extends this with the given cls
         *
         * @param {Class} cls
         * @param {Boolean} override_properties
         * @param {Boolean} extend_static
         */
        $self.Extends = function (cls, override_properties, extend_static) {
            // <debug>
            __assert_arg(override_properties, ["null", "boolean"], 2);
            __assert_arg(extend_static, ["null", "boolean"], 3);
            if (cls === undefined) {
                trace();
            }

            if (!__instanceof(cls, "Class")) {
                throw new Error("cls must be a class!");
            }
            // </debug>

            if (cls.$myself !== undefined) { //this class is instanced use the Class
                cls = cls.$myself;
            }

            override_properties = override_properties === true;

            extend_static = extend_static || false;

            __verbose("extends", __typeof($self), " width ", __typeof(cls), "override_properties: ", override_properties);

            $inheritance.push(cls.prototype.$name);

            var method_list = cls.get_methods(),
                method_obj = {},
                properties = cls.get_properties(),
                data_properties = cls.get_properties_descriptors(),
                abst = cls.get_abstract_methods(),
                finals = cls.get_final_methods(),
                statics,
                statics_obj,
                i,
                max = method_list.length,
                p_name = null;

            __verbose("extending methods", method_list);

            for (i = 0; i < max; ++i) {
                p_name = method_list[i];
                method_obj[p_name] = cls.prototype[p_name];
            }
            this.Implements(method_obj);

            console.log(p_name, "extends", override_properties);

            __verbose("extending properties", properties);
            max = properties.length;
            for (i = 0; i < max; ++i) {
                p_name = properties[i];

                __verbose("new option: ", p_name, cls.prototype[p_name], $properties.indexOf(p_name) === -1);

                if (
                    override_properties === true ||
                    (override_properties === false && $properties.indexOf(p_name) === -1)
                ) {
                    $properties.push(p_name);
                    $data_descriptors[p_name] = data_properties[p_name];
                    this.prototype[p_name] = cls.prototype[p_name];
                }
            }


            __verbose("extending abstract_methods methods", abst);
            max = abst.length;
            for (i = 0; i < max; ++i) {
                $abstract_methods.push(abst[i]);
                if (cls.prototype[abst[i]]) {
                    this.prototype[abst[i]] = cls.prototype[abst[i]];
                }
            }

            __verbose("extending final methods", finals);
            max = finals.length;
            for (i = 0; i < max; ++i) {
                $final_methods.push(finals[i]);
            }
            if (extend_static) {
                __verbose("extending static methods", finals);
                statics = cls.get_static_methods();
                max = statics.length;
                statics_obj = {};
                for (i = 0; i < max; ++i) {
                    statics_obj[statics[i]] = cls[statics[i]];
                }
                this.Static(statics_obj);
            }

            cls.__add_child(this);

            return this;
        };

        $self.__add_child = function (cls) {
            $childs.push(cls);
        };

        /**
         * set the properties of a class.
         * naming conventions
         * __XXX are considered private
         * _XXX used it with caution
         *
         * properties({vector: {x:0}}); // set vector x
         * properties({vector: {y:0}}); // add y to the vector, so xy :)
         *
         * @param {Object} properties
         * @returns this for chaining
         */
        $self.properties = function (properties) {
            // <debug>
            __assert_arg(properties, ["object"], 1);
            // </debug>

            var key = null;
            for (key in properties) {
                $self.__set(true, key, properties[key], {
                    writable : true,
                    enumerable : true,
                    configurable : true
                }, false);
            }

            return this;
        };

        $self.property = function (name, get, set, enumerable) {
            var i;
            enumerable = enumerable === true;
            // <debug>
            __assert_arg(name, "string", 0);
            __assert_arg(get, "function", 1);
            __assert_arg(set, ["null", "function"], 2);
            __assert_arg(enumerable, ["null", "boolean"], 4);

            if ($self.prototype[name]) {
                __warning("override property: " + name);
            }
            // </debug>

            $self.__set(true, name, undefined, {
                set: set,
                get: get,
                enumerable : enumerable ? true : false,
                configurable : false
            }, false);
        };

        /**
         * create an alias of src_method_name, src_method_name must exists
         *
         * Note: replicate changes in Childs
         *
         * @param String dst_method_name
         * @param String src_method_name
         */
        $self.alias = function (src_method_name, dst_method_name) {
            // <debug>
            __assert_arg(src_method_name, "string", 1);
            __assert_arg(dst_method_name, "string", 2);

            if (typeof this.prototype[src_method_name] !== "function") {
                throw new Error("function[" + src_method_name + "] not found, so cannot be aliased");
            }

            if (this.prototype[dst_method_name] !== undefined) {
                throw new Error("[" + dst_method_name + "] is in use");
            }
            // </debug>

            $self.__set(true, dst_method_name, this.prototype[src_method_name], {
                writable: true,
                configurable: true
            }, false);

            return this;
        };

        /**
         * rename a method, src_method_name must exists and dst_method_name dont or throw
         *
         * @param String dst_method_name
         * @param String src_method_name
        $self.rename = function (src_method_name, dst_method_name) {
            var i;

            // <debug>
            __assert_arg(src_method_name, "string", 1);
            __assert_arg(dst_method_name, "string", 2);
            // </debug>

            if (typeof this.prototype[src_method_name] !== "function") {
                throw new Error("function[" + src_method_name + "] not found, so cannot be aliased");
            }

            if (this.prototype[dst_method_name] !== undefined) {
                throw new Error("[" + dst_method_name + "] is in use");
            }

            this.prototype[dst_method_name] = this.prototype[src_method_name];

            // add the new one
            $methods.push(dst_method_name);

            // remove the old one
            delete this.prototype[src_method_name];
            $methods.splice($methods.indexOf(src_method_name), 1);

            for (i = 0; i < $childs.length; ++i) {
                $childs[i].rename(src_method_name, dst_method_name);
            }

            return this;
        };
         */

        /**
         * hide some functions from the prototype using defineProperty enumerable:false
         *
         * @param Array properties
         */
        $self.hide = function (properties) {
            // <debug>
            __assert_arg(properties, "array", 1);

            // TODO: all properties must exists!

            // </debug>

            var i,
                max = properties.length,
                k;

            for (i = 0; i < max; ++i) {
                k = properties[i];

                $data_descriptors[k].enumerable = false;
                $data_descriptors[k].configurable = false;

                $self.__set(true, k, $self.prototype[properties[i]], $data_descriptors[k], false);
            }

            return this;
        };


        /**
         * Seal the instances
         * maybe need a method to seal the current prototypes...
         *
         * @param Array methods
         */
        $self.seal = function () {
            $seal_instances = true;

            return this;
        };
        /**
         * return all methods implemented
         * @returns {Array}
         */
        $self.get_methods = function () {
            return $methods;
        };
        /**
         * return all abstract methods implemented
         * @returns {Array}
         */
        $self.get_abstract_methods = function () {
            return $abstract_methods;
        };
        /**
         * return all static methods
         * @returns {Array}
         */
        $self.get_static_methods = function () {
            return $static_methods;
        };
        /**
         * return all final methods
         * @returns {Array}
         */
        $self.get_final_methods = function () {
            return $final_methods;
        };
        /**
         * get all properties
         * @returns {Array}
         */
        $self.get_properties = function () {
            return $properties;
        };

        /**
         * get the descriptor of each property
         * @returns {Array}
         */
        $self.get_properties_descriptors = function () {
            return $data_descriptors;
        };


        // <compat 1.x>
        $self["implements"] = function (methods, finale) {
            console.log("implements is deprecated use Implements instead");
            console.log(new Error().stack);

            return $self.Implements(methods, finale);
        };
        $self["final"] = function (methods) {
            console.log("final is deprecated use Final instead");
            console.log(new Error().stack);

            return $self.Final(methods);
        };
        $self["static"] = function (methods) {
            console.log("static is deprecated use Static instead");
            console.log(new Error().stack);

            return $self.Static(methods);
        };
        $self["extends"] = function (cls, override_properties, extend_static) {
            console.log("extends is deprecated use Extends instead");
            console.log(new Error().stack);

            return $self.Extends(cls, override_properties, extend_static);
        };
        $self["abstract"] = function (methods) {
            console.log("abstract is deprecated use Abstract instead");
            console.log(new Error().stack);

            return $self.Abstract(methods);
        };
        // </compat 1.x>

        if (properties !== undefined && __typeof(properties) !== "null") {
            $self.properties(properties);
        }

        $self.$prototyping = true;

        return $self;
    };

    exports.__assert_arg          = __assert_arg;

    exports.Typeof                = __typeof;
    exports.Instanceof            = __instanceof;

    // <compat 1.x>
    exports["typeof"]                = function (val) {
        console.log("typeof is deprecated use Typeof instead");
        console.log(new Error().stack);

        return __typeof(val);
    };
    exports["instanceof"]            = function (cls, cls_name) {
        console.log("instanceof is deprecated use Instanceof instead");
        console.log(new Error().stack);

        return __instanceof(cls, cls_name);
    };
    // </compat 1.x>

    exports.clone                 = __clone;

    exports.Classize              = Classize;
    exports.Class                 = Class;


}(typeof module === "undefined" ? NodeClass : module.exports, typeof module === "undefined"));
