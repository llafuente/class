(function (exports, browser) {
    "use strict";
    var defineProperty = Object.defineProperty,
        Event,
        debug = true,
        notStrictEqual = require('assert').notStrictEqual,
        strictEqual = require('assert').strictEqual;

    Event = function (fn) {
        this.fn = fn;
        this.events = {};
    };

    Event.prototype.fn = undefined;
    Event.prototype.events = undefined;
    Event.prototype.attachs = 0;

    Event.prototype.attach = function (event_name, event_handler, times, internal) {
        if (debug) {
            strictEqual(this.events[event_name], undefined, "Event[" + event_name + "] can only be attached once");
        }

        this.events[event_name] = {
            handler: event_handler,
            times: times || -1,
            internal: internal,
            stop: false
        };

        ++this.attachs;

        return this;
    };

    Event.prototype.detach = function (event_name) {
        delete this.events[event_name];
        --this.attachs;

        return this;
    };

    Event.prototype.attached = function () {
        return this.attachs !== 0;
    };

    Event.prototype.remove = function (event_name) {
        this.events[event_name].times = 1;

        return this;
    };

    Event.prototype.stop = function (event_name) {
        this.events[event_name].stop = true;

        return this;
    };


    /**
     * wrap the function with event functionality
     * @type Event
     */
    exports.Eventize = function (fn) {

        defineProperty(fn, "$Event", {
            value: new Event(fn),
            writable : true,
            enumerable : false,
            configurable : false
        });

        return fn;
    };

}("undefined" === typeof module ? NodeClass : module.exports, "undefined" === typeof module));

