var fs = require('vinyl-fs');
var mock = require('mock-fs');
var helper = require('../helper');

describe('ignored', function () {

    var ignored = require('../../lib/ignored');

    afterEach(function () {
        mock.restore();
    });

    it('specials can\'t be ignored', function (done) {
        var specials = ['lib/c.spec.js'];

        var checkSpecials = function (file) {

            var found = specials.some(function (special) {
                var filepath = file.relative.replace('\\', '/');
                return filepath.indexOf(special) > -1;
            });

            expect(found).toBeTruthy();

        };

        mock({
            'test/lib': {
                'a.spec.js': '',
                'b.spec.js': '',
                'c.spec.js': ''
            }
        });

        fs.src('test/**/*.spec.js')
            .pipe(ignored({ignore: '**/*.spec.js'}, specials))
            .pipe(helper.pass(checkSpecials, done));
    });

    it('should be ignored by .fecsignore', function (done) {
        var check = jasmine.createSpy('check');

        mock({
            '.fecsignore': '**/*.spec.js',
            'test/lib': {
                'a.spec.js': '',
                'b.spec.js': '',
                'c.spec.js': ''
            }
        });

        fs.src('test/**/*.spec.js')
            .pipe(ignored({}, []))
            .pipe(helper.pass(
                check,
                function () {
                    expect(check).not.toHaveBeenCalled();
                    done();
                }
            ));
    });

    it('can be unignored/specials by .fecsignore', function (done) {
        var check = jasmine.createSpy('check');

        mock({
            '.fecsignore': '*.js\n!foo.js',
            'test/': {
                'foo.js': '',
                'bar.js': ''
            }
        });

        fs.src('test/**/*.js')
            .pipe(ignored({}, []))
            .pipe(
                helper.pass(
                    check,
                    function () {
                        expect(check.calls.count()).toEqual(1);
                        done();
                    }
                )
            );
    });

    it('should be loged when ignored on debug', function (done) {
        var check = jasmine.createSpy('check');
        var log = console.log;

        console.log = jasmine.createSpy('log');

        mock({
            '.fecsignore': '*.js\n!foo.js',
            'test/': {
                'foo.js': '',
                'bar.js': ''
            }
        });

        fs.src('test/**/*.js')
            .pipe(ignored({debug: true}, []))
            .pipe(
                helper.pass(
                    check,
                    function () {
                        expect(console.log).toHaveBeenCalledWith('%s is ignored by %s.', 'bar.js', '*.js');
                        console.log = log;
                        done();
                    }
                )
            );

    });

});
