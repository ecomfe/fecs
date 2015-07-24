var mock = require('mock-fs');
var util = require('../../lib/util');

describe('util', function () {

    describe('parseError', function () {

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
                expect(error.line).toBe(11);
                expect(error.column).toBe(23);
                expect(error.message).toMatch(/foo\([^\)]+\)/);
            }
        });

        it('error from csshint', function (done) {
            var success = function (result) {
                var errors = result[0].messages;
                expect(errors.length).toEqual(1);

                var error = util.parseError({foo: 'bar'}, errors[0]);

                expect(error).not.toBeNull();
                expect(error.foo).toBe('bar');
                expect(error.line).toBe(2);
                expect(error.column).toBe(5);
                done();
            };

            var fail = function (result) {
                var errors = result[0].messages;
                var error = util.parseError({}, errors[0]);
                expect(error.message).toBe('success');
                done();
            };

            var csshint = require('csshint');
            var config = util.getConfig('csshint');

            csshint.checkString('\nbody{}', 'path/to/file.css', config).then(success, fail);
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

    });

    describe('getConfig', function () {

        it('no filepath and defaults', function () {
            var config = util.getConfig('eslint');

            expect(config.rules).toBeDefined();
            expect(config.rules['fecs-valid-jsdoc'][0]).toEqual(2);
        });

        it('current filepath', function () {
            var config = util.getConfig('eslint', __dirname, null, true);

            expect(config.rules).toBeDefined();
            expect(config.rules['fecs-valid-jsdoc']).toEqual(0);
        });

        it('not exists path and key', function () {
            var config = util.getConfig('foo-bar', 'foo/bar');

            expect(config).toEqual({});
        });

        it('use package.json when no .fecsrc', function () {
            mock({
                'package.json': '{"fecs":{"test": {"foo": "bar"}}}'
            });

            var config = util.getConfig('test', './test', null, true);
            expect(config.foo).toBe('bar');
            mock.restore();
        });

        it('use package.json when no .fecsrc', function () {
            mock({
                'package.json': '{}'
            });

            var config = util.getConfig('test', './test', {}, true);
            expect(config.foo).toBeUndefined();
            mock.restore();
        });

        it('no lookup', function () {
            var config = util.config;

            expect(util.getConfig('eslint', false, {})).toEqual(config.eslint);
            expect(util.getConfig('esformatter', false, {})).toEqual(config.esformatter);
            expect(util.getConfig('jformatter', false, {})).toEqual(config.jformatter);
            expect(util.getConfig('jshint', false, {})).toEqual(config.jshint);
            expect(util.getConfig('lesslint', false, {})).toEqual(config.lesslint);
            expect(util.getConfig('htmlcs', false, {})).toEqual(config.htmlcs);
            expect(util.getConfig('csscomb', false, {})).toEqual(config.csscomb);
            expect(util.getConfig('csshint', false, {})).toEqual(config.csshint);

            expect(util.getConfig('unknown', false, {})).toEqual({});

        });

    });

    describe('buildPattern', function () {

        it('default options', function () {
            var patterns = util.buildPattern();

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toEqual('lib/**/*.{js,css,less,html,htm}');
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
            var patterns = util.buildPattern(['cli', 'lib', 'index.js', 'package.json'], 'js');

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toEqual('cli/**/*.js');
            expect(patterns[1]).toEqual('lib/**/*.js');
            expect(patterns[2]).toEqual('index.js');
        });

        it('no specify dirs and no .fecsrc, use package.json', function () {
            mock({
                'package.json': '{"fecs": {"files": ["foo"]}}'
            });

            var patterns = util.buildPattern();

            expect(patterns.length).toEqual(2);
            expect(patterns[0]).toEqual('foo');

            mock.restore();
        });

        it('no specify dirs and no .fecsrc and package.json', function () {
            mock({});

            var patterns = util.buildPattern();

            expect(patterns.length).toEqual(2);
            expect(patterns[0]).toEqual('./**/*.{js,css,less,html,htm}');

            mock.restore();
        });

        it('invalid files', function () {
            mock({
                'test/foo.bar': ''
            });

            var patterns = util.buildPattern(['test/foo.bar'], 'js');
            expect(patterns.length).toEqual(0);

            mock.restore();
        });

    });

    describe('parseJSON', function () {

        it('invalid file', function () {
            var json = util.parseJSON('');

            expect(json).toEqual({});
        });


        it('invalid json', function () {
            var json = util.parseJSON('{a}');

            expect(json).toEqual({});
        });

        it('invalid json and throw error', function () {
            var read = function () {
                util.parseJSON('');
            };

            process.env.DEBUG = true;

            expect(read).toThrow();

            process.env.DEBUG = false;
        });

        it('json with no comment', function () {
            var json = util.parseJSON('{"foo": false, "bar": true}');

            expect(json.foo).toBeFalsy();
            expect(json.bar).toBeTruthy();
        });

        it('json with comments', function () {
            var json = util.parseJSON(''
                + '{\n'
                +   '// for foo\n'
                +   '"foo": false, // foo too\r\n'
                +   '"bar": true /* for bar */\n'
                + '}'
            );

            expect(json.foo).toBeFalsy();
            expect(json.bar).toBeTruthy();
        });

        it('comments have no side effects', function () {
            var nocommentJSON = util.parseJSON('{"foo": false, "bar": true}');
            var commentJSON = util.parseJSON(''
                + '{\n'
                +   '// for foo\r\n'
                +   '"foo": false, // foo too\n'
                +   '"bar": true /* for bar */\n'
                + '}'
            );

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

            expect(maps.htmlcs).not.toBeUndefined();
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
            expect(maps.htmlcsMap).not.toBeUndefined();
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

    it('extend', function () {
        var foo = {foo: 1};
        var bar = {bar: 1};
        var baz = {foo: 0, baz: 1};

        var foobar = util.extend(foo, bar);

        expect(foobar.foo).toBe(foo.foo);
        expect(foobar.bar).toBe(bar.bar);

        var foobaz = util.extend(foo, baz);

        expect(foobaz.foo).toBe(baz.foo);
        expect(foobaz.baz).toBe(baz.baz);
    });

    it('extend should ignore property from prototype', function () {
        var foo = {foo: 1};
        var bar = Object.create({bar: 1});

        var foobar = util.extend(foo, bar);

        expect(foobar.foo).toBe(foo.foo);
        expect(foobar.bar).toBeUndefined();
    });

    it('mix', function () {
        var foo = {foo: 1};
        var bar = {bar: 1};
        var baz = {foo: 0, baz: 1};

        var foobaz = util.mix(foo, bar, baz, null, undefined);


        expect(foobaz.foo).toBe(baz.foo);
        expect(foobaz.baz).toBe(baz.baz);
    });

    it('colorize', function () {
        var chalk = require('chalk');

        var foo = 'foo';
        var colors = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];

        var allMatch = colors.every(function (color) {
            return util.colorize(foo, color) === chalk[color](foo);
        });

        expect(allMatch).toBeTruthy();
        expect(util.colorize(foo)).toBe(foo);
        expect(util.colorize(foo, 'invalidColor')).toBe(foo);


    });

    describe('buildRegExp', function () {

        it('from RegExp', function () {
            var jsFiles = /\.js$/i;
            var reg = util.buildRegExp(jsFiles);

            expect(reg).toBe(jsFiles);
        });

        it('from string', function () {
            var jsFiles = /\.js$/i;
            var suffix = 'js';
            var reg = util.buildRegExp(suffix);

            expect(reg).toEqual(jsFiles);
        });

        it('from string split by comma', function () {
            var jsFiles = /\.(js|coffee|ts)$/i;
            var suffix = 'js,coffee,ts';
            var reg = util.buildRegExp(suffix);

            expect(reg).toEqual(jsFiles);
        });

        it('match any files', function () {
            var reg = util.buildRegExp();

            expect(reg).toEqual(/.*/i);
        });


    });
});
