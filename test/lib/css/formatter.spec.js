var File = require('vinyl');

var formatter = require('../../../lib/css/formatter');
var cli = require('../../../lib/cli');


describe('formatter', function () {

    it('options', function () {
        var options = formatter.options;

        expect(options.name).toBe('csscomb');
        expect(options.type).toBe('css');
        expect(options.suffix).toEqual(/\.(?:c|le|sa|sc)ss$/);

    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.styl'}),
            new File({contents: new Buffer(''), path: 'test/b.js'}),
            new File({contents: new Buffer(''), path: 'test/baz.xcss'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return formatter.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.css'}),
            new File({contents: new Buffer(''), path: 'test/b.less'}),
            new File({contents: new Buffer(''), path: 'test/c.sass'}),
            new File({contents: new Buffer(''), path: 'test/d.scss'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !formatter.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });


    it('format', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format('p{\nheight:0px}', 'path/to/file.css', options);

        expect(formatted).toEqual('p {\n    height: 0;\n}\n');

    });

    it('html files should be take as css', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format('p{\nheight:0px}', 'path/to/file.html', options);

        expect(formatted).toEqual('p {\n    height: 0;\n}\n');

    });

    it('one empty rule should be ignore', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format('a{}', 'path/to/file.css', options);

        expect(formatted).toEqual('a{}');

    });

    it('one empty rule should be throw in debug', function () {

        var options = cli.getOptions([]);
        options.debug = true;

        var format = function () {
            formatter.format('a{}', 'path/to/file.css', options);
        };

        expect(format).toThrow();

    });

});
