var File = require('vinyl');

var checker = require('../../../lib/less/checker');
var cli = require('../../../lib/cli');


describe('checker', function () {


    it('options', function () {
        var options = checker.options;

        expect(options.name).toBe('lesslint');
        expect(options.type).toBe('css');
        expect(options.suffix).toBe('less');

    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.styl'}),
            new File({contents: new Buffer(''), path: 'test/b.scss'}),
            new File({contents: new Buffer(''), path: 'test/b.sass'}),
            new File({contents: new Buffer(''), path: 'test/baz.css'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return checker.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.m.less'}),
            new File({contents: new Buffer(''), path: 'test/b.min.less'}),
            new File({contents: new Buffer(''), path: 'test/c.less'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });

    it('check with promise', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('\np {\n    height:0px;\n}', 'path/to/file.less', options)
            .then(function (errors) {
                expect(errors.length).toBe(1);

                var error = errors[0];
                expect(error.line).toBe(3);
                expect(error.rule).toBe('zero-unit');
                done();
            });

    });

    it('check with invalid content', function (done) {

        var options = cli.getOptions([]);

        checker
            .check('body{', 'path/to/file.less', options)
            .then(function (errors) {
                expect(errors.length).toBe(1);
                expect(errors[0].code).toBe('999');
                done();
            });

    });

});
