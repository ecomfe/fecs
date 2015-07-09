var File = require('vinyl');

var formatter = require('../../../lib/html/formatter');
var cli = require('../../../lib/cli');


describe('formatter', function () {

    it('options', function () {
        var options = formatter.options;

        expect(options.name).toBe('htmlcs');
        expect(options.type).toBe('html');
        expect(options.suffix).toBe('html,htm');

    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.js'}),
            new File({contents: new Buffer(''), path: 'test/b.css'}),
            new File({contents: new Buffer(''), path: 'test/baz.less'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return formatter.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.html'}),
            new File({contents: new Buffer(''), path: 'test/a.htm'}),
            new File({contents: new Buffer(''), path: 'test/b.m.html'}),
            new File({contents: new Buffer(''), path: 'test/b.m.htm'}),
            new File({contents: new Buffer(''), path: 'test/c.min.html'}),
            new File({contents: new Buffer(''), path: 'test/c.min.htm'}),
            new File({contents: new Buffer(''), path: 'test/c.tpl.html'}),
            new File({contents: new Buffer(''), path: 'test/c.tpl.htm'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !formatter.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });


    it('format', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format('<html></html>', 'path/to/file.html', options);

        expect(formatted).toEqual('<!DOCTYPE html>\n<html lang="zh-CN"></html>');

    });

    it('format js in html', function () {

        var options = cli.getOptions([]);
        options.lookup = false;

        var formatted = formatter.format('<script>var foo=1</script>', 'path/to/file.html', options);

        expect(formatted).toEqual('<script>\n    var foo = 1;\n</script>');

    });

    it('format js in html - specify type', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format(
            '<script type="text/javascript">var foo=1</script>',
            'path/to/file.html',
            options
        );

        expect(formatted).toEqual('<script>\n    var foo = 1;\n</script>');

    });

    it('format js in html - specify unknown type', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format(
            '<script type="text/tpl">var foo=1</script>',
            'path/to/file.html',
            options
        );

        expect(formatted).toEqual('<script type="text/tpl">\nvar foo=1\n</script>');

    });

    it('format css in html', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format('<style>body{height:0px}</style>', 'path/to/file.html', options);

        expect(formatted).toEqual('<style>\n    body {\n        height: 0;\n    }\n</style>');

    });

    it('format css in html - specify type', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format(
            '<style type="text/css">body{height:0px}</style>',
            'path/to/file.html',
            options
        );

        expect(formatted).toEqual('<style>\n    body {\n        height: 0;\n    }\n</style>');

    });

    it('format css in html - specify unknown type', function () {

        var options = cli.getOptions([]);

        var formatted = formatter.format(
            '<style type="text/less">body{height:0px}</style>',
            'path/to/file.html',
            options
        );

        expect(formatted).toEqual('<style type="text/less">\nbody{height:0px}\n</style>');

    });




});
