(function (exports, browser) {
    "use strict";
    //
    // Events (Event Emitter)
    // support

    /**
     * wrap the function with event functionality
     * @type Event
     */
    exports.Eventize = function (fn) {
        var attached = null;
        fn.$name = "Event";
        fn.$extends = [ "Class" ];
        fn.$__ev_times = -1;
        fn.$__ev_internal = false;
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
            this.$__ev_times = false;
        };
        fn.stop = function () {
            attached.$ev_stop = true;
        };
        // TODO next / prev / position / length

        return fn;
    };

}(typeof module == "undefined" ? NodeClass : module.exports, typeof module == "undefined"));
