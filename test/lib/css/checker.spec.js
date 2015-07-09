var File = require('vinyl');

var checker = require('../../../lib/css/checker');
var cli = require('../../../lib/cli');


describe('checker', function () {


    it('options', function () {
        var options = checker.options;

        expect(options.name).toBe('csshint');
        expect(options.type).toBe('css');
        expect(options.suffix).toBe('css');
        expect(options.ignore).toBe('m.css,min.css');

    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.m.css'}),
            new File({contents: new Buffer(''), path: 'test/b.min.css'}),
            new File({contents: new Buffer(''), path: 'test/baz.x'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return checker.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.css'}),
            new File({contents: new Buffer(''), path: 'test/b.css'}),
            new File({contents: new Buffer(''), path: 'test/c.css'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });

    it('isValid with no ignore', function () {
        checker.options.ignore = '';

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.foo.css'}),
            new File({contents: new Buffer(''), path: 'test/b.bar.css'}),
            new File({contents: new Buffer(''), path: 'test/a.css'}),
            new File({contents: new Buffer(''), path: 'test/b.css'}),
            new File({contents: new Buffer(''), path: 'test/c.css'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();
    });


    it('check with promise', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('\nbody{}', 'path/to/file.css', options)
            .then(function (errors) {
                expect(errors.length).toBe(1);

                var error = errors[0];
                expect(error.line).toBe(2);
                expect(error.column).toBe(5);
                expect(error.rule).toBe('require-before-space');
                done();
            });

    });

    it('check with invalid content', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('body{', 'path/to/file.css', options)
            .then(function (errors) {
                expect(errors.length).toBe(1);
                expect(errors[0].code).toBe('999');
                done();
            });

    });

});
