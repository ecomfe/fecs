var mock = require('mock-fs');
var fs = require('vinyl-fs');
var File = require('vinyl');
var Q = require('q');

var helper = require('../helper');

var Formatter = require('../../lib/formatter');
var formatter = new Formatter({
    name: 'bbd',
    type: 'spec',
    suffix: 'spec',
    ignore: 'foo.spec,bar.spec'
});


describe('formatter', function () {

    beforeEach(function () {
        mock({
            test: {
                'a.spec': '',
                'b.spec': '',
                'c.spec': '',
                'foo.spec': '',
                'bar.spec': '',
                'baz.x': ''
            }
        });
    });

    afterEach(function () {
        mock.restore();
    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.foo.spec'}),
            new File({contents: new Buffer(''), path: 'test/b.bar.spec'}),
            new File({contents: new Buffer(''), path: 'test/baz.x'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return formatter.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.spec'}),
            new File({contents: new Buffer(''), path: 'test/b.spec'}),
            new File({contents: new Buffer(''), path: 'test/c.spec'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !formatter.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });

    it('isValid with no ignore', function () {
        formatter.options.ignore = '';

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.foo.spec'}),
            new File({contents: new Buffer(''), path: 'test/b.bar.spec'}),
            new File({contents: new Buffer(''), path: 'test/a.spec'}),
            new File({contents: new Buffer(''), path: 'test/b.spec'}),
            new File({contents: new Buffer(''), path: 'test/c.spec'})
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

        fs.src('test/**')
            .pipe(formatter.exec({}))
            .on('end', function () {
                expect(formatter.register).toHaveBeenCalled();
                formatter.register = register;
                done();
            });

    });

    it('check with callback', function (done) {

        formatter.format = function (contents, path, cliOptions, callback) {
            expect(typeof callback).toBe('function');
            return callback('');
        };

        fs.src('test/**')
            .pipe(formatter.exec({}))
            .on('end', done);

    });

    it('check with promise', function (done) {

        formatter.format = function (contents, path, cliOptions) {
            var deferred = Q.defer();
            deferred.resolve([true]);
            return deferred.promise;
        };

        fs.src('test/**')
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
