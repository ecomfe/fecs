var fs = require('vinyl-fs');
var File = require('vinyl');

var helper = require('../helper');

var Formatter = require('../../lib/formatter');
var formatter = new Formatter({
    name: 'bbd',
    type: 'spec',
    suffix: 'spec',
    ignore: 'foo.spec,bar.spec'
});


describe('formatter', function () {

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: Buffer.from(''), path: 'test/a.foo.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.bar.spec'}),
            new File({contents: Buffer.from(''), path: 'test/baz.x'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return formatter.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: Buffer.from(''), path: 'test/a.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.spec'}),
            new File({contents: Buffer.from(''), path: 'test/c.spec'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !formatter.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });

    it('isValid with no ignore', function () {
        formatter.options.ignore = '';

        var validFiles = [
            new File({contents: Buffer.from(''), path: 'test/a.foo.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.bar.spec'}),
            new File({contents: Buffer.from(''), path: 'test/a.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.spec'}),
            new File({contents: Buffer.from(''), path: 'test/c.spec'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !formatter.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();
    });

    it('format() will throw', function () {
        expect(formatter.format).toThrow();
    });

    it('register should be call when exec', function (done) {
        var register = formatter.register;
        spyOn(formatter, 'register').and.callThrough();

        formatter.format = function (contents, path, cliOptions) {
            return '';
        };

        fs.src('test/fixture/checker/**')
            .pipe(formatter.exec({}))
            .on('end', function () {
                expect(formatter.register).toHaveBeenCalled();
                formatter.register = register;
                done();
            });

    });

    it('format with callback', function (done) {

        formatter.format = function (contents, path, cliOptions, callback) {
            expect(typeof callback).toBe('function');
            return callback('');
        };

        fs.src('test/fixture/checker/**')
            .pipe(formatter.exec({}))
            .on('end', done);

    });

    it('format with promise', function (done) {

        formatter.format = function (contents, path, cliOptions) {
            return Promise.resolve([true]);
        };

        fs.src('test/fixture/checker/**')
            .pipe(formatter.exec({}))
            .pipe(helper.pass(
                function (file) {
                    if (!file.errors) {
                        return;
                    }

                    expect(file.errors[0]).toBeTruthy();
                }, done)
            );
    });

});
