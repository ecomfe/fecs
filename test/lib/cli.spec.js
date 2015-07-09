var mock = require('mock-fs');
var msee = require('msee');

var cli = require('../../lib/cli');
var pkg = require('../../package');


describe('cli', function () {

    afterEach(function () {
        mock.restore();
    });

    it('display version when pass --version or -v', function () {
        var log = console.log;
        console.log = jasmine.createSpy('log');

        process.argv = ['node', 'fecs', '--version'];
        cli.parse();

        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith('%s %s', pkg.name, pkg.version);

        process.argv = ['node', 'fecs', '-v'];
        cli.parse();

        expect(console.log.calls.count()).toEqual(2);
        expect(console.log.calls.mostRecent().args).toEqual(['%s %s', pkg.name, pkg.version]);

        console.log = log;
    });

    it('display help when pass --help or -h', function () {
        var log = console.log;
        console.log = jasmine.createSpy('log');

        var map = {
            doc: {
                'check.md': 'check',
                'fecs.md': 'fecs'
            }
        };
        mock(map);

        process.argv = ['node', 'fecs', 'check', '--help'];
        cli.parse();

        expect(console.log).toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(msee.parse(map.doc['check.md']));

        process.argv = ['node', 'fecs', '--help'];
        cli.parse();

        expect(console.log.calls.mostRecent().args).toEqual([msee.parse(map.doc['fecs.md'])]);


        process.argv = ['node', 'fecs', 'N/A', '--help'];
        cli.parse();

        expect(console.log.calls.mostRecent().args[0].indexOf('Have no help for command named')).toEqual(0);

        console.log = log;
    });


    it('default for check command', function () {
        var check = require('../../cli/check');
        var run = check.run;

        check.run = jasmine.createSpy('check-run');

        process.argv = ['node', 'fecs'];
        cli.parse();

        expect(check.run).toHaveBeenCalled();

        process.argv = ['node', 'fecs', 'check'];
        cli.parse();

        expect(check.run.calls.count()).toBe(2);

        check.run = run;
    });

    it('check silent', function () {
        var check = require('../../cli/check');
        var run = check.run;
        var log = console.log;

        check.run = jasmine.createSpy('check-run');
        var unuseLog = console.log = jasmine.createSpy('unuse-log');

        process.argv = ['node', 'fecs', '--silent'];
        cli.parse();
        console.log('hidden');

        expect(check.run).toHaveBeenCalled();
        expect(unuseLog).not.toHaveBeenCalled();

        check.run = run;
        console.log = log;
    });
});
