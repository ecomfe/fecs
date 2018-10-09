var mock = require('mock-fs');
var fs = require('vinyl-fs');
var File = require('vinyl');

var helper = require('../helper');

var Checker = require('../../lib/checker');
var checker = new Checker({
    name: 'bbd',
    type: 'spec',
    suffix: 'spec',
    ignore: 'foo.spec,bar.spec'
});


describe('checker', function () {

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
            new File({contents: Buffer.from(''), path: 'test/a.foo.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.bar.spec'}),
            new File({contents: Buffer.from(''), path: 'test/baz.x'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return checker.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: Buffer.from(''), path: 'test/a.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.spec'}),
            new File({contents: Buffer.from(''), path: 'test/c.spec'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });

    it('isValid with no ignore', function () {
        checker.options.ignore = '';

        var validFiles = [
            new File({contents: Buffer.from(''), path: 'test/a.foo.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.bar.spec'}),
            new File({contents: Buffer.from(''), path: 'test/a.spec'}),
            new File({contents: Buffer.from(''), path: 'test/b.spec'}),
            new File({contents: Buffer.from(''), path: 'test/c.spec'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();
    });

    it('check() will throw', function () {
        expect(checker.check).toThrow();
    });

    it('check with callback', function (done) {

        checker.check = function (contents, path, cliOptions, callback) {
            expect(typeof callback).toBe('function');
            return callback([]);
        };

        fs.src('test/**')
            .pipe(checker.exec({}))
            .on('end', done);

    });

    it('check with promise', function (done) {

        checker.check = function (contents, path, cliOptions) {
            return Promise.resolve([true]);
        };

        fs.src('test/**')
            .pipe(checker.exec({}))
            .pipe(helper.pass(
                function (file) {
                    if (!file.errors) {
                        return;
                    }

                    expect(file.errors[0]).toBeTruthy();
                }, done)
            );
    });

    it('check sync', function (done) {

        checker.check = function (contents, path, cliOptions) {
            return [true];
        };

        fs.src('test/**')
            .pipe(checker.exec({}))
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
