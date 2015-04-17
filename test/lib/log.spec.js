var chalk = require('chalk');

var log   = require('../../lib/log');
var util  = require('../../lib/util');

describe('log', function () {

    it('color false', function () {
        var logger = log(false);

        expect(logger).not.toBeNull();

        var consoleLog = console.log;
        spyOn(console, 'log');
        ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach(function (name, i) {
            expect(typeof logger[name]).toBe('function');

            logger[name]();
            expect(console.log).toHaveBeenCalled();
            expect(console.log.calls.count()).toBe(i * 2 + 1);
            expect(console.log.calls.mostRecent().args[0]).toBe();

            logger[name]('foo');
            expect(console.log.calls.count()).toBe((i + 1) * 2);
            expect(console.log.calls.mostRecent().args[0])
                .toBe('fecs [' + util.fixWidth(name.toUpperCase(), 5) + '] foo');
        });
        console.log = consoleLog;
    });

    it('color true', function () {
        var logger = log(true);
        var fns = [
            {name: 'trace', color: chalk.grey, level: 0},
            {name: 'debug', color: chalk.grey, level: 1},
            {name: 'info', color: chalk.green, level: 2},
            {name: 'warn', color: chalk.yellow, level: 3},
            {name: 'error', color: chalk.red, level: 4},
            {name: 'fatal', color: chalk.red, level: 5}
        ];

        var consoleLog = console.log;
        spyOn(console, 'log');
        ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].forEach(function (name, i) {
            expect(typeof logger[name]).toBe('function');
            expect(fns[i].name).toBe(name);

            logger[name]();
            expect(console.log).toHaveBeenCalled();
            expect(console.log.calls.count()).toBe(i * 2 + 1);
            expect(console.log.calls.mostRecent().args[0]).toBe();

            logger[name]('foo');
            expect(console.log.calls.count()).toBe((i + 1) * 2);
            expect(console.log.calls.mostRecent().args[0])
                .toBe('fecs ' + fns[i].color(util.fixWidth(name.toUpperCase(), 5)) + ' foo');
        });
        console.log = consoleLog;
    });


});
