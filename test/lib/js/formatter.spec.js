var File = require('vinyl');

var formatter = require('../../../lib/js/formatter');
var cli = require('../../../lib/cli');


describe('formatter', function () {

    it('options', function () {
        var options = formatter.options;

        expect(options.name).toBe('esformatter');
        expect(options.type).toBe('js');
        expect(options.suffix).toBe('js,es,es6');

    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.html'}),
            new File({contents: new Buffer(''), path: 'test/b.css'}),
            new File({contents: new Buffer(''), path: 'test/baz.less'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return formatter.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.js'}),
            new File({contents: new Buffer(''), path: 'test/b.m.js'}),
            new File({contents: new Buffer(''), path: 'test/c.min.js'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !formatter.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });


    it('format', function () {

        var options = cli.getOptions();

        var formatted = formatter.format('var foo=bar', 'path/to/file.js', options);

        expect(formatted).toEqual('var foo = bar;\n');

    });


    it('syntax error', function () {

        var options = cli.getOptions();

        var formatted = formatter.format('var foo=', 'path/to/file.js', options);

        expect(formatted).toEqual('var foo=');

    });


    it('syntax error should be throw in debug', function () {

        var options = cli.getOptions();
        options.debug = true;

        var format = function () {
            formatter.format('var foo=', 'path/to/file.js', options);
        };

        expect(format).toThrow();

    });

});
