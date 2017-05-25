var File = require('vinyl');

var checker = require('../../../lib/js/checker');
var cli = require('../../../lib/cli');

describe('checker', function () {


    it('options', function () {
        var options = checker.options;

        expect(options.name).toBe('eslint');
        expect(options.type).toBe('js');
        expect(options.suffix).toBe('js,jsx,es,es6,vue,san');
        expect(options.ignore).toEqual(/\.(m|min|mock|mockup)\.(js|es|es6)$/);

    });

    it('isValid', function () {
        var invalidFiles = [
            new File({contents: new Buffer(''), path: 'test/a.m.js'}),
            new File({contents: new Buffer(''), path: 'test/b.min.js'}),
            new File({contents: new Buffer(''), path: 'test/c.mock.js'}),
            new File({contents: new Buffer(''), path: 'test/d.mockup.js'}),
            new File({contents: new Buffer(''), path: 'test/baz.x'})
        ];

        var hasValid = invalidFiles.some(function (file) {
            return checker.isValid(file);
        });

        expect(hasValid).toBeFalsy();

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.js'}),
            new File({contents: new Buffer(''), path: 'test/b.js'}),
            new File({contents: new Buffer(''), path: 'test/c.js'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();

    });

    it('isValid with no ignore', function () {
        checker.options.ignore = '';

        var validFiles = [
            new File({contents: new Buffer(''), path: 'test/a.foo.js'}),
            new File({contents: new Buffer(''), path: 'test/b.bar.js'}),
            new File({contents: new Buffer(''), path: 'test/a.js'}),
            new File({contents: new Buffer(''), path: 'test/b.js'}),
            new File({contents: new Buffer(''), path: 'test/c.js'})
        ];

        var hasInvalid = validFiles.some(function (file) {
            return !checker.isValid(file);
        });

        expect(hasInvalid).toBeFalsy();
    });


    it('check invalid content', function () {

        var options = cli.getOptions();

        var errors = checker.check('var foo = 1;\n', 'path/to/file.js', options);
        expect(errors.length).toBe(3);
        expect(errors[0].rule).toBe('fecs-valid-jsdoc');
        expect(errors[1].rule).toBe('fecs-valid-jsdoc');
        expect(errors[2].rule).toBe('no-unused-vars');

    });

    it('use maxerr to limit errors count', function () {

        var options = cli.getOptions();
        options.maxerr = 2;

        var errors = checker.check('var foo = 1;\n', 'path/to/file.js', options);
        expect(errors.length).toBe(2);
        expect(errors[0].rule).toBe('fecs-valid-jsdoc');
        expect(errors[1].rule).toBe('fecs-valid-jsdoc');

    });

    it('check content with syntax error', function () {

        var options = cli.getOptions();

        var errors = checker.check('var foo =', 'path/to/file.js', options);
        expect(errors.length).toBe(1);
        expect(errors[0].code).toBe('998');
        expect(errors[0].rule).toBe('syntax');

    });

    it('check js in html like files', function () {

        var options = cli.getOptions();

        var errors = checker.check(
            '<template>{{foo}}</template>\n<script>\nvar foo =\n</script>',
            'path/to/file.san',
            options
        );
        expect(errors.length).toBe(1);
        expect(errors[0].line).toBe(4);
        expect(errors[0].code).toBe('998');
        expect(errors[0].rule).toBe('syntax');

    });


    it('error code should be 998 when throw error in eslint.verify', function () {

        var options = cli.getOptions();

        var max = 2;
        Object.defineProperty(options, 'maxerr', {
            get: function () {
                max--;
                if (!max) {
                    throw new Error('code 998');
                }
                return max;
            }
        });

        var errors = checker.check('var foo =', 'path/to/file.js', options);

        expect(errors.length).toBe(1);
        expect(errors[0].code).toBe('998');

    });

    it('assign es with 5', function () {

        var options = cli.getOptions(['--es', '5']);
        var esnext = require('../../../lib/js/esnext');
        var verify = esnext.verify;

        esnext.verify = function (code, config) {
            expect(config.parser).toBe('espree');
            expect(config.env.es6).toBe(false);
            expect(config.parserOptions.ecmaVersion).toBe(5);
        };

        checker.check('var foo = true;', 'path/to/file.js', options);

        expect(options.es).toBe(5);

        esnext.verify = verify;

    });

    it('assign es with 7', function () {

        var options = cli.getOptions(['--es', '7']);
        var esnext = require('../../../lib/js/esnext');
        var verify = esnext.verify;

        esnext.verify = function (code, config) {
            expect(config.env.es6).toBe(true);
        };

        checker.check('var foo = true;', 'path/to/file.js', options);

        expect(options.es).toBe(7);

        esnext.verify = verify;

    });

});
