(function(exports, browser) {

    var Class = browser ? $.Class : require("./class.js").Class;
    var Events = browser ? $.Events : require("./events.js").Events;
    var __typeof = browser ? $.typeof : require("./class.js").typeof;

    //
    // Sequences
    // execute function in sequence but, dont wait a function to end, it wait a function to tell Sequence "work.done"
    //

    /**
     * @type Seq
     * @events
     *     * newwork
     *     * workdone
     *     * empty
     */
    exports.Sequence = Class("Seq", {
        $__queued : [],
        $__fired : false,
        $__args: null
    });

    exports.Sequence.extends(Events);

    exports.Sequence.implements({
        /**
         * @member Seq
         * @param {Function} fn
         */
        push : function (fn) {
            var i,
                max;
            if (__typeof(fn) == "array") {
                max = fn.length;
                for (i = 0; i < max; ++i) {
                    this.push(fn[i]);
                }
                return this;
            }
            this.$__queued.push(fn);

            this.emit("work:new", [this]);

            return this;
        },
        /**
         * try to run a new work
         */
        fire : function (args, internal) {
            if (this.$__queued.length === 0 || this.$__fired === true) {
                if (internal === true) {
                    this.emit("empty", [this]);
                }
                return;
            }

            this.$__fired = true;
            if(!this.$__args) {
                this.$__args = [this];
            } else {
                this.$__args.unshift(this);
            }
            this.$__queued[0].apply(null, this.$__args);
            this.$__args = null;

            return this;
        },
        /**
         * call this when your work is done, and send desired arguments to the next work
         */
        done: function (arguments_to_next) {
            this.emit("work:done", [this]);
            this.$__fired = false;
            if(this.$__queued.length === 0) {
                this.emit("empty", [this]);

                return this;
            }
            this.$__queued.shift();

            if(arguments_to_next) {
                this.$__args = Array.from(arguments_to_next);
            }

            this.fire(arguments_to_next, true);

            return this;
        },
        clear: function() {
            this.$__queued = [];
        }
    });

}(typeof module == "undefined" ? $ : module.exports, typeof module == "undefined"));