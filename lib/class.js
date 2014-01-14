(function (exports, browser) {
    "use strict";

    require("object-enhancements");

    var debug = true,
        __typeof,
        __instanceof,
        __class,
        __extends,
        __get_abstract,
        __remove_abstract,
        __abstract,
        __alias,
        __static,
        __method,
        __property,
        __clone,
        __typed_clone,
        __typed_clone_or_merge,
        __config_property,
        __rtypeof,
        defineProperty = Object.defineProperty,
        ArrayPush = Array.prototype.push,
        classes = {},
        __object_typeof = Object["typeof"];

    exports.getClass = function (name) {
        return classes[name] || null;
    };

    /**
     * get the type of val. note: undefined/nan is null
     *
     * @param {mixed}
     *            val
     * @returns {String}
     */
    exports["typeof"] = __typeof = function (value) {
        var type = __object_typeof(value);

        if ("object" === type && value.$class !== undefined) {
            return "instance";
        }

        if ("function" === type && value.$class !== undefined) {
            return "class";
        }

        return type;
    };

    exports.__typed_clone = __typed_clone = function (obj, types) {
        var i,
            type,
            ar,
            cobj,
            key;


        type = types.__ || types;

        //console.log("tc = ", types, type, obj);

        switch (type) {
        case "string":
            return obj.substring();
        case "number":
            return 0 + obj;
        case "boolean":
            return obj ? true : false;
        case "array":
            i = obj.length;

            if (i === 0) {
                return [];
            }

            ar = new Array(i);
            while (i--) {
                ar[i] = __typed_clone(obj[i], types[i]);
            }
            return ar;

        case "object":
            cobj = {};
            for (key in obj) {
                cobj[key] = __typed_clone(obj[key], types[key]);
            }
            return cobj;
        case "class":
        case "function":
            return obj;
        case "regexp":
            return new RegExp(obj.source);
        case "date":
            return new Date(obj);
        }

        throw new Error("type (" + JSON.stringify(types) + ") cannot be cloned");
    };


    exports.__typed_clone_or_merge = __typed_clone_or_merge = function (obj, merge, types) {
        var i,
            type,
            ar,
            cobj,
            key,
            ar_merge,
            obj_merge;


        type = types.__ || types;

        //console.log("tc = ", types, type, obj);

        switch (type) {
        case "string":
            /*
            console.log("obj", obj);
            console.log("merge", merge);
            console.log("merge", typeof merge);
            console.log("merge", typeof merge.subtring);
            console.log("merge", typeof obj.subtring);
            console.log("merge", Object.prototype.toString.call(obj));
            console.log("merge", Object.prototype.toString.call(" ?? "));
            console.log("merge", typeof "".substring);
            */
            return (merge !== undefined ? merge : obj) + "";
        case "number":
            return 0 + (merge !== undefined ? merge : obj);
        case "boolean":
            return merge !== undefined ? (merge ? true : false) : (obj ? true : false);
        case "null":
            //be sure is not a class
            if (merge && merge.$class) {
                return merge;
            }
            return Object.clone(merge);
        case "array":
            i = obj.length;

            if (i === 0) {
                return [];
            }

            ar = new Array(i);
            ar_merge = merge || [];
            while (i--) {
                ar[i] = __typed_clone_or_merge(obj[i], ar_merge[i], types[i]);
            }
            return ar;

        case "object":
            cobj = {};
            obj_merge = merge || {};
            for (key in obj) {
                cobj[key] = __typed_clone_or_merge(obj[key], obj_merge[key], types[key]);
            }
            return cobj;
        case "class":
        case "function":
            return merge !== undefined ? merge : obj;
        case "regexp":
            return new RegExp(merge !== undefined ? merge.source : obj.source);
        case "date":
            return new Date(merge !== undefined ? merge : obj);
        }

        throw new Error("type (" + JSON.stringify(types) + ") cannot be cloned");
    };

    exports.__rtypeof = __rtypeof = function (obj) {
        var type = __typeof(obj),
            ret,
            key,
            i,
            max;

        if (type === "object") {
            ret = {__: type};

            for (key in obj) {
                ret[key] = __rtypeof(obj[key]);
            }

            return ret;
        }

        if (type === "array") {
            ret = {__: type};

            for (i = 0, max = obj.length; i < max; ++i) {
                ret[i] = __rtypeof(obj[i]);
            }

            return ret;
        }
        return type;
    };

    /**
     * Return is cls is instance of cls_name. To use it you must use the Class
     * constructor.
     *
     * @param ClassInstance cls
     * @param String|Class cls_name
     * @returns Boolean
     */
    exports["instanceof"] = __instanceof = function (cls, cls_name) {
        if (!cls || !cls_name) {
            return false;
        }

        var name = cls.$class || null,
            $inheritance;

        if (name === null) {
            return false;
        }

        // cls_name could be a class
        if ("string" !== typeof cls_name) {
            cls_name = cls_name.$class || null;
            if (cls_name === null) {
                return false;
            }
        }

        if (name === cls_name) {
            return true;
        }

        $inheritance = cls.$inheritance;

        if ($inheritance === null) {
            return false;
        }

        return $inheritance.indexOf(cls_name) !== -1;
    };

    // performance version, this speed up this a lot!!
    function __clone_descriptors(descriptor) {
        var out = {};
        if (descriptor.value !== undefined) {
            out.value = __clone(descriptor.value);
            out.writable = descriptor.writable === true;
        } else {
            out.set = descriptor.set;
            out.get = descriptor.get;
        }
        out.enumerable = descriptor.enumerable === true;
        out.configurable = descriptor.configurable === true;

        return out;
    }

    exports.$interface = function (name, methods) {
        var $self = function () {
            throw new Error("interfaces cannot be instanced");
        };
        $self.$class = $self.prototype.$class = name;

        classes[name] = $self;

        defineProperty($self.prototype, "$class", {
            value: name,
            writable : false,
            enumerable : false,
            configurable : false
        });
        $self.$class = $self.prototype.$class;

        defineProperty($self.prototype, "$inheritance", {
            value: [name],
            writable : true,
            enumerable : false,
            configurable : false
        });
        $self.$inheritance = $self.prototype.$inheritance;

        $self.methods = [];
        $self.abstracts = [];

        // helpers
        $self.abstract = function (name, method) {
            __abstract(this, name, method);
            return this;
        };

        $self.toString = function () {
            return "[interface " + name + "]";
        };

        return $self;
    };

    exports.$class = __class = function (name, extend, implement, initialize, autoset, seal) {
        if (classes[name]) {
            throw new Error("You cannot have the same class name, use namespaces ej: namespace/class");
        }

        if ("function" === typeof extend) {
            // (name, initialize, autoset, seal)
            seal = initialize;
            autoset = implement;
            initialize = extend;
            extend = null;
            implement = null;
        } else if ("function" === typeof implement) {
            // (name, extend, initialize, autoset)
            seal = autoset;
            autoset = initialize;
            initialize = implement;
            implement = null;
        } else {
            implement = implement || null;
            extend = extend || null;
            initialize = initialize || null;
        }

        if ("function" === typeof initialize) {
            autoset = autoset === undefined ? false : autoset;
        } else {
            autoset = autoset === undefined ? true : autoset;
        }

        var $self,
            i,
            max;

        // use named argument to speed up things a bit :)
        $self = function (options, a2, a3, a4) {
            var i,
                max,
                prop = $self.properties,
                desc,
                d;

            if ($self.abstracts.length) {
                console.error("(node-class) instance: abstract methods found");
                for (i = 0, max = $self.abstracts.length; i < max; ++i) {
                    console.error("(node-class)", $self.abstracts[i].name, $self.abstracts[i].lambda.toString());
                }
                throw new Error("need to implement method above");
            }

            if (prop.length) {
                desc = $self.descriptors;
                if (!autoset || !options) {
                    for (i = 0, max = prop.length; i < max; ++i) {
                        d = desc[i];
                        name = prop[i];
                        if ("object" === d.type.__ || "array" === d.type.__) {
                            this[name] = __typed_clone(this[name], d.type);
                        }
                    }
                } else {
                    for (i = 0, max = prop.length; i < max; ++i) {
                        d = desc[i];
                        name = prop[i];
                        //console.log(this[name], options, d.type);
                        this[name] = __typed_clone_or_merge(this[name], options[name], d.type);
                    }
                }
            }

            if (this.initialize) {
                switch (arguments.length) {
                case 0:
                    this.initialize();
                    break;
                case 1:
                    this.initialize(options);
                    break;
                case 2:
                    this.initialize(options, a2);
                    break;
                case 3:
                    this.initialize(options, a2, a3);
                    break;
                case 4:
                    this.initialize(options, a2, a3, a4);
                    break;
                default:
                    this.initialize.apply(this, arguments);
                    break;
                }

            }

            if (seal) {
                Object.seal(this);
            }
        };

        classes[name] = $self;

        defineProperty($self.prototype, "$class", {
            value: name,
            writable : false,
            enumerable : false,
            configurable : false
        });
        $self.$class = $self.prototype.$class;

        defineProperty($self.prototype, "$inheritance", {
            value: [name],
            writable : true,
            enumerable : false,
            configurable : false
        });
        $self.$inheritance = $self.prototype.$inheritance;

        defineProperty($self.prototype, "__parent", {
            value: null,
            writable : true,
            enumerable : false,
            configurable : false
        });

        defineProperty($self.prototype, "$self", {
            value: $self,
            writable : false,
            enumerable : false,
            configurable : false
        });

        defineProperty($self, "$autoset", {
            value: autoset,
            writable : false,
            enumerable : true,
            configurable : false
        });

        $self.properties = [];
        $self.descriptors = [];
        $self.methods = [];
        $self.abstracts = [];
        $self.statics = [];

        if (extend) {
            for (i = 0, max = extend.length; i < max; ++i) {
                __extends($self, extend[i]);
            }
        }

        if (implement) {
            for (i = 0, max = implement.length; i < max; ++i) {
                __extends($self, implement[i]);
            }
        }

        if (initialize) {
            __method($self, "initialize", initialize);
        }

        // helpers
        $self.method = function (name, method) {
            __method(this, name, method);
            return this;
        };

        $self.property = function (name, method, _default, meta) {
            __property(this, name, method, _default, meta);
            return this;
        };

        $self.alias = function (existing, alias) {
            __alias(this, existing, alias);
            return this;
        };

        $self.abstract = function (name, method) {
            __abstract(this, name, method);
            return this;
        };

        $self.config_property = function (name, configurables, functions) {
            __config_property(this, name, configurables, functions);
            return this;
        };

        $self.toString = function () {
            return "[class " + name + "]";
        };

        return $self;
    };

    exports.abstract = __abstract = function ($class, name, method) {
        $class.abstracts.push({
            name: name,
            lambda: method
        });
    };

    exports.get_abstract = __get_abstract = function ($class, name) {
        var i,
            max,
            abs = $class.abstracts;

        for (i = 0, max = abs.length; i < max; ++i) {
            if (abs[i].name === name) {
                return abs[i];
            }
        }

        return null;
    };

    exports.__config_property = __config_property = function ($class, name, configurables, functions) {
        var Config = function () {
                var i;
                for (i in configurables) {
                    this[i] = configurables[i];
                }
            },
            functions = functions || null,
            values = Object.clone(configurables),
            i;

        Object.each(configurables, function (v, k) {
            //console.log("define", k, v);
            Config.prototype[k] = v;

            if (functions && functions.indexOf(k) !== -1) {
                defineProperty(Config.prototype, k.toUpperCase(), {
                    value: function(val) {
                        this[k] = val;
                        return this;
                    },
                    enumerable: false
                });
            } else {
                defineProperty(Config.prototype, k.toUpperCase(), {
                    get: function () {
                        this[k] = !this[k];
                        return this;
                    }
                });
            }
        });

        defineProperty($class, name, {
            get: function () {
                return new Config();
            }
        });
    };

    __remove_abstract = function ($class, name) {
        var i,
            max,
            abs = $class.abstracts;

        for (i = 0, max = abs.length; i < max; ++i) {
            if (abs[i].name === name) {
                $class.abstracts.splice(i, 1);
                return true;
            }
        }

        return false;
    };

    exports.property = __property = function ($class, name, _default, meta) {
        if ($class.methods.indexOf(name) !== -1) {
            throw new Error("Cannot define property[" + name + "] with the same name as a method");
        }

        $class.properties.push(name);

        if (meta) {
            meta.type = __rtypeof(_default);
            $class.descriptors.push(meta);
        } else {
            $class.descriptors.push({
                type: __rtypeof(_default)
            });
        }
        $class.prototype[name] = _default;
    };

    exports.alias = __alias = function ($class, existing, alias) {
        if ($class.methods.indexOf(existing) === -1) {
            throw new Error("method[" + existing + "] not found, cannot be aliased");
        }

        if ($class.methods.indexOf(alias) !== -1) {
            throw new Error("method[" + alias + "] found, cannot be aliased if target exists");
        }

        $class.prototype[alias] = $class.prototype[existing];
        $class.methods.push(alias);
    };
    exports["static"] = __static = function ($class, name, method) {
        $class[name] = method;
        $class.statics.push(name);
    }


    exports.method = __method = function ($class, name, method) {
        //console.log("method: add [", name, "] method to ", $class.$class);

        if ($class.properties.indexOf(name) !== -1) {
            throw new Error("Cannot define method[" + name + "] with the same name as a property");
        }

        // is in abstract ?
        var abs = __get_abstract($class, name),
            parent;

        //console.log("method: is abstract ?", $class.abstracts, name, abs);

        if (abs) {
            //check parameter count
            //console.log("method: ", abs.lambda.length, " = ", method.length);
            if (abs.lambda.length !== method.length) {
                throw new Error("[" + name + "] method has: " + method.length + " parameter(s) expected: " + abs.lambda.length);
            }
            //remove
            __remove_abstract($class, name);
        }

        //console.log("method: after", $class.$class, $class.abstracts.length, name, abs);


        if ($class.methods.indexOf(name) !== -1) {
            // parent support
            parent = $class.prototype[name];

            $class.prototype[name] = function (a1, a2, a3, a4) {
                var swap_parent = this.__parent,
                    ret;
                this.__parent = parent;


                switch (arguments.length) {
                case 0:
                    ret = method.call(this);
                    break;
                case 1:
                    ret = method.call(this, a1);
                    break;
                case 2:
                    ret = method.call(this, a1, a2);
                    break;
                case 3:
                    ret = method.call(this, a1, a2, a3);
                    break;
                case 4:
                    ret = method.call(this, a1, a2, a3, a4);
                    break;
                default:
                    ret = method.apply(this, arguments);
                    break;
                }

                if (swap_parent === undefined) {
                    delete this.__parent;
                } else {
                    this.__parent = swap_parent;
                }
                return ret;
            };
        } else {
            $class.prototype[name] = method;
        }

        $class.methods.push(name);
    };

    module.exports["extends"] = exports.Extends  = __extends = function ($class, implement) {
        if (!classes[implement]) {
            throw new Error("class not found");
        }

        var $target = classes[implement],
            properties = $target.properties || {}, // interfaces dont have it
            methods = $target.methods || {}, // interfaces dont have it
            abstracts = $target.abstracts,
            statics = $target.statics || [],
            proto = $target.prototype,
            i,
            max,
            m;

        $class.prototype.$inheritance.push(implement);

        for (i = 0, max = properties.length; i < max; ++i) {
            m = properties[i];
            __property($class, m, proto[m]);
        }

        for (i = 0, max = methods.length; i < max; ++i) {
            m = methods[i];
            __method($class, m, proto[m]);
        }

        for (i = 0, max = abstracts.length; i < max; ++i) {
            m = abstracts[i];
            __abstract($class, m.name, m.lambda);
        }

        for (i = 0, max = statics.length; i < max; ++i) {
            m = statics[i];
            __static($class, m, $target[m]);
        }

    };

    //wrapper for easy to use
    module.exports["class"] = exports.Class = function (name, definition, autoset, seal) {
        var _extends = definition["extends"] || definition.Extends || [],
            _implements = definition["implements"] || definition.Implements || [],
            initialize = definition.initialize || null,
            i,
            o,
            cls;

        if ("object" === typeof autoset) {
            seal = autoset.seal || false;
            autoset = autoset.autoset || false;
        }

        delete definition["extends"];
        delete definition["implements"];
        delete definition.initialize;

        cls = __class(name, _extends, _implements, initialize, autoset, seal);

        for (i in definition) {
            o = definition[i];
            if ("function" === typeof o) {
                // check if has a prefix
                if (i.indexOf("abstract ") === 0) {
                    __abstract(cls, i.substring(9), o);
                } else if (i.indexOf("static ") === 0) {
                    __static(cls, i.substring(7), o);
                } else {
                    __method(cls, i, o);
                }
            } else {
                __property(cls, i, o);
            }
        }

        return cls;
    };

}("undefined" === typeof module ? NodeClass : module.exports, "undefined" === typeof module));
