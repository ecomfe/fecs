var util = require('../../lib/util');

describe('util', function () {

    describe('parseError', function () {

        it('error from csshint', function () {
            var csshint = require('csshint');
            var errors = csshint.checkString('\nbody{}');

            expect(errors.length).toEqual(1);

            var error = util.parseError({foo: 'bar'}, errors[0]);

            expect(error).not.toBeNull();
            expect(error.foo).toBe('bar');
            expect(error.line).toBe(2);
            expect(error.column).toBe(5);
        });

        it('error from eslint', function () {
            var eslint = require('eslint').linter;
            var errors = eslint.verify('\nvar a', {rules: {semi: 2}});

            expect(errors.length).toEqual(1);

            var error = util.parseError({foo: 'bar'}, errors[0]);

            expect(error).not.toBeNull();
            expect(error.foo).toBe('bar');
            expect(error.line).toBe(2);
            expect(error.column).toBe(5);
        });

        it('error from exception', function () {

            try {
                throw new Error('foo', 'bar');
            }
            catch (e) {
                var error = util.parseError({foo: 'bar'}, e);

                expect(error).not.toBeNull();
                expect(error.foo).toBe('bar');

                // 行列信息必须对应上面 throw new 的位置
                //                         ^
                // 有变化时必须更正以下两个期望值
                expect(error.line).toBe(38);
                expect(error.column).toBe(23);
                expect(error.message).toMatch(/foo\([^\)]+\)/);
            }
        });

    });

    describe('getConfig', function () {

        it('no filepath and defaults', function () {
            var config = util.getConfig('eslint');

            expect(config.rules).toBeDefined();
            expect(config.rules['fecs-valid-jsdoc'][0]).toEqual(2);
        });

        it('current filepath', function () {
            var config = util.getConfig('eslint', __dirname);

            expect(config.rules).toBeDefined();
            expect(config.rules['fecs-valid-jsdoc']).toEqual(0);
        });

        it('not exists path', function () {
            var config = util.getConfig('foo-bar', 'foo/bar');

            expect(config).toEqual({});
        });

    });

    describe('buildPattern', function () {

        it('default options', function () {
            var patterns = util.buildPattern();

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toEqual('lib/**/*.{js,css,html}');
        });

        it('js only', function () {
            var patterns = util.buildPattern([], 'js');

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toEqual('lib/**/*.js');
        });

        it('not exists dirs', function () {
            var patterns = util.buildPattern(['foo', 'bar', 'baz/foo'], 'js');

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toEqual('foo');
        });

        it('exists dirs', function () {
            var patterns = util.buildPattern(['cli', 'lib', 'index.js'], 'js');

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toEqual('cli/**/*.js');
            expect(patterns[1]).toEqual('lib/**/*.js');
            expect(patterns[2]).toEqual('index.js');
        });

    });

    describe('parseJSON', function () {

        it('invalid file', function () {
            var json = util.parseJSON('foo.json');

            expect(json).toEqual({});
        });


        it('invalid json', function () {
            var json = util.parseJSON('.npmignore');

            expect(json).toEqual({});
        });

        it('json with no comment', function () {
            var json = util.parseJSON('test/fixture/json-with-nocomment.json');

            expect(json.foo).toBeFalsy();
            expect(json.bar).toBeTruthy();
        });

        it('json with comments', function () {
            var json = util.parseJSON('test/fixture/json-with-comments.json');

            expect(json.foo).toBeFalsy();
            expect(json.bar).toBeTruthy();
        });

        it('comments have no side effect', function () {
            var nocommentJSON = util.parseJSON('test/fixture/json-with-nocomment.json');
            var commentJSON = util.parseJSON('test/fixture/json-with-comments.json');

            expect(nocommentJSON).toEqual(commentJSON);
        });

    });

    describe('readConfigs', function () {

        it('from lib/css', function () {
            var maps = {};
            util.readConfigs('lib/css', maps);

            expect(maps).not.toEqual({});
            expect(maps.csscomb).not.toBeUndefined();
            expect(maps.csshint).not.toBeUndefined();
        });

        it('from lib/js', function () {
            var maps = {};
            util.readConfigs('lib/js', maps);

            expect(maps).not.toEqual({});
            expect(maps.eslint).not.toBeUndefined();
            expect(maps.jformatter).not.toBeUndefined();
            expect(maps.jshint).not.toBeUndefined();
        });

        it('from lib/html', function () {
            var maps = {};
            util.readConfigs('lib/html', maps);

            expect(maps.htmlhint).not.toBeUndefined();
        });

        it('from lib/reporter/baidu', function () {
            var maps = {};
            util.readConfigs('lib/reporter/baidu', maps);

            expect(maps).not.toEqual({});
            expect(maps.javascript).not.toBeUndefined();
            expect(maps.css).not.toBeUndefined();
            expect(maps.html).not.toBeUndefined();
            expect(maps.eslintMap).not.toBeUndefined();
            expect(maps.csshintMap).not.toBeUndefined();
            expect(maps.htmlhintMap).not.toBeUndefined();
        });

        it('from no exists path', function () {
            var maps = {};
            util.readConfigs('foo/bar', maps);

            expect(maps).toEqual({});
        });

    });

    it('fixWidth', function () {
        var foo = 11.11;
        var strFoo = foo.toString();

        expect(util.fixWidth(foo)).toEqual(util.fixWidth(foo, 3));
        expect(util.fixWidth(foo, 4)).toEqual(strFoo);
        expect(util.fixWidth(foo, 6)).toEqual(' ' + strFoo);
        expect(util.fixWidth(foo, 8)).toEqual('   ' + strFoo);
        expect(util.fixWidth(foo, 8, 'xxxx')).toEqual('xxx' + strFoo);
    });

    it('format', function () {
        var str = '%s %s';
        var hello = 'hello %s';

        expect(util.format(str, 'hello')).toEqual('hello %s');
        expect(util.format(str, 'hello', 'world')).toEqual('hello world');
        expect(util.format(str, 'hello', 'hello', 'hello')).toEqual('hello hello hello');
        expect(util.format(hello, 'world')).toEqual('hello world');
    });

});
