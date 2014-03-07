var ass = require('ass').enable(),
    cp = require('child_process'),
    kid,
    test = [
        __dirname + "/test-class.js",
        __dirname + "/test-events.js",
        __dirname + "/test-iterable.js"
    ],
    current_test = 0;

// .. run all of your tests, spawning instrumented processes



function next_test() {
    if (current_test < test.length) {
        kid = cp.fork(test[current_test++], [], { stdio: 'inherit' });

        kid.on("exit", next_test);
    } else {

        ass.report('html', function(err, report) {
            require('fs').writeFileSync('./coverage.html', report);

            ass.report('json', function(err, r) {
                console.log(r);
            });
        });

    }
}




next_test();