var fs = require('vinyl-fs');
var helper = require('../helper');

describe('ignored', function () {

    var ignored = require('../../lib/ignored');

    it('specials can\'t be ignored', function (done) {
        var specials = ['lib/c.spec.js'];

        var checkSpecials = function (file) {
            var found = specials.some(function (special) {
                var filepath = file.relative.replace('\\', '/');
                return filepath.indexOf(special) > -1;
            });

            expect(found).toBeTruthy();

        };

        fs.src('test/fixture/ignored/*.spec.js')
            .pipe(ignored({ignore: '**/*.spec.js'}, specials))
            .pipe(helper.pass(checkSpecials, done));
    });

    it('should be ignored simply', function (done) {
        var check = jasmine.createSpy('check');

        fs.src('test/fixture/ignored/*.js')
            .pipe(ignored({ignore: ['*.min.js', '*.spec.js']}, []))
            .pipe(helper.pass(
                check,
                function () {
                    expect(check).not.toHaveBeenCalled();
                    done();
                }
            ));
    });


    it('should be ignored by .fecsignore', function (done) {
        var check = jasmine.createSpy('check');

        fs.src('test/fixture/ignored/*.spec')
            .pipe(ignored({}, [], 'test/fixture/ignored/.fecsignore'))
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

        fs.src('test/fixture/ignored/*.js')
            .pipe(ignored({}, [], 'test/fixture/ignored/.unfecsignore'))
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

        fs.src('test/fixture/ignored/*.js')
            .pipe(ignored({debug: true}, [], 'test/fixture/ignored/.unfecsignore'))
            .pipe(
                helper.pass(
                    check,
                    function () {
                        expect(console.log).toHaveBeenCalledWith('%s is ignored by %s.', 'a.min.js', '*.js');
                        console.log = log;
                        done();
                    }
                )
            );

    });

});
