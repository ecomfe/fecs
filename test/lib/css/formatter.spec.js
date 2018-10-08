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
            new File({contents: Buffer.from(''), path: 'test/a.styl'}),
            new File({contents: Buffer.from(''), path: 'test/b.js'}),
            new File({contents: Buffer.from(''), path: 'test/baz.xcss'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return formatter.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: Buffer.from(''), path: 'test/a.css'}),
            new File({contents: Buffer.from(''), path: 'test/b.less'}),
            new File({contents: Buffer.from(''), path: 'test/c.sass'}),
            new File({contents: Buffer.from(''), path: 'test/d.scss'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !formatter.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });


    it('format', function (done) {

        var options = cli.getOptions();

        formatter
            .format('p{\nheight:0px}', 'path/to/file.css', options)
            .then(function (formatted) {
                expect(formatted).toEqual('p {\n    height: 0;\n}\n');
                done();
            });

    });

    it('html files should be take as css', function (done) {

        var options = cli.getOptions();

        formatter
            .format('p{\nheight:0px}', 'path/to/file.html', options)
            .then(function (formatted) {
                expect(formatted).toEqual('p {\n    height: 0;\n}\n');
                done();
            });
    });

    it('one empty rule should be ignore', function (done) {

        var options = cli.getOptions();

        formatter
            .format('a{}', 'path/to/file.css', options)
            .then(function (formatted) {
                expect(formatted).toEqual('a{}');
                done();
            });
    });

    it('one empty rule should be throw in debug', function (done) {

        var options = cli.getOptions();
        options.debug = true;

        formatter
            .format('a{}', 'path/to/file.css', options)
            .catch(function (error) {
                expect(error != null).toBe(true);
                done();
            });


    });

});
