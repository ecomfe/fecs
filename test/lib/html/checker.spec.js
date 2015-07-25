var File = require('vinyl');

var checker = require('../../../lib/html/checker');
var cli = require('../../../lib/cli');

checker.register();

describe('checker', function () {


    it('options', function () {
        var options = checker.options;

        expect(options.name).toBe('htmlcs');
        expect(options.type).toBe('html');
        expect(options.suffix).toBe('html,htm');
        expect(options.ignore).toEqual(/\.(tpl|m|min)\.html?$/i);

    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.m.html'}),
            new File({contents: new Buffer(''), path: 'test/a.m.htm'}),
            new File({contents: new Buffer(''), path: 'test/b.min.html'}),
            new File({contents: new Buffer(''), path: 'test/b.min.htm'}),
            new File({contents: new Buffer(''), path: 'test/c.css'}),
            new File({contents: new Buffer(''), path: 'test/d.js'}),
            new File({contents: new Buffer(''), path: 'test/d.tpl.html'}),
            new File({contents: new Buffer(''), path: 'test/d.tpl.htm'}),
            new File({contents: new Buffer(''), path: 'test/baz.x'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return checker.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.html'}),
            new File({contents: new Buffer(''), path: 'test/a.htm'}),
            new File({contents: new Buffer(''), path: 'test/b.html'}),
            new File({contents: new Buffer(''), path: 'test/c.html'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });

    it('isValid with no ignore', function () {
        checker.options.ignore = '';

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.tpl.html'}),
            new File({contents: new Buffer(''), path: 'test/a.tpl.htm'}),
            new File({contents: new Buffer(''), path: 'test/b.min.html'}),
            new File({contents: new Buffer(''), path: 'test/b.min.htm'}),
            new File({contents: new Buffer(''), path: 'test/a.m.html'}),
            new File({contents: new Buffer(''), path: 'test/a.m.htm'}),
            new File({contents: new Buffer(''), path: 'test/b.html'}),
            new File({contents: new Buffer(''), path: 'test/c.htm'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();
    });


    it('check invalid content', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('<html></html>', 'path/to/file.html', options)
            .then(function (errors) {
                expect(errors.length).toBe(2);
                expect(errors[0].rule).toBe('doctype');
                expect(errors[1].rule).toBe('html-lang');
                done();
            });
    });

    it('check js content', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('<script>\nvar foo = 1;</script>', 'path/to/file.html', options)
            .then(function (errors) {
                expect(errors.length).toBe(1);
                expect(errors[0].rule).toBe('no-unused-vars');
                done();
            });
    });

    it('check js content without indent', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('<script>alert(1);</script>', 'path/to/file.html', options)
            .then(function (errors) {
                expect(errors.length).toBe(1);
                expect(errors[0].rule).toBe('fecs-indent');
                done();
            });
    });

    it('check js content with no error', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('<script>\nrequire([\'jquery\'], function (jquery) {\n});</script>', 'path/to/file.html', options)
            .then(function (errors) {
                expect(errors.length).toBe(0);
                done();
            });
    });

    it('do not check js content when --type=html', function () {

        var options = cli.getOptions([]);
        options.type = 'html';

        var errors = checker.check('<script>var foo = 1;</script>', 'path/to/file.html', options);
        expect(errors.length).toBe(0);
    });

    it('check css content', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('<style>\nbody{}</style>', 'path/to/file.html', options)
            .then(function (errors) {
                expect(errors.length).toBe(3);
                expect(errors[0].rule).toBe('css-in-head');
                expect(errors[1].rule).toBe('style-disabled');
                expect(errors[2].rule).toBe('require-before-space');
                done();
            });
    });

    it('check css content without indent', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('<style>body {}</style>', 'path/to/file.html', options)
            .then(function (errors) {
                expect(errors.length).toBe(3);
                expect(errors[0].rule).toBe('css-in-head');
                expect(errors[1].rule).toBe('style-disabled');
                expect(errors[2].rule).toBe('block-indent');
                done();
            });
    });

    it('check css content with no error', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('<style>\nbody {\n}</style>', 'path/to/file.html', options)
            .then(function (errors) {
                expect(errors.length).toBe(2);
                expect(errors[0].rule).toBe('css-in-head');
                expect(errors[1].rule).toBe('style-disabled');
                done();
            });
    });


});
