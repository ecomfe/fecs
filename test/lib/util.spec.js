var mock = require('mock-fs');
var fs = require('vinyl-fs');
var util = require('../../lib/util');

describe('util', function () {

    describe('parseError', function () {

        it('error from active exception', function () {

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
                expect(error.line).toBe(12);
                expect(error.column).toBe(23);
                expect(error.message).toMatch(/foo\([^\)]+\)/);
            }
        });

        it('error from syntax error', function () {

            var error = util.parseError(
                {foo: 'bar'},
                {
                    stack: 'path/to/file.js:123\nSyntaxError: Unexpected token return'
                }
            );

            expect(error).not.toBeNull();
            expect(error.foo).toBe('bar');

            expect(error.line).toBe(123);
            expect(error.message.indexOf('SyntaxError: Unexpected token return') > -1).toBe(true);
        });

        it('error from error', function () {

            var error = util.parseError(
                {foo: 'bar'},
                {
                    message: 'To be or not to be',
                    stack: 'path/to/file.js:12:3\n'
                }
            );

            expect(error).not.toBeNull();
            expect(error.foo).toBe('bar');

            expect(error.line).toBe(12);
            expect(error.column).toBe(3);
            expect(error.message.indexOf('To be or not to be') > -1).toBe(true);
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
            expect(error.column).toBe(6);
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

        it('use .eslintrc', function () {
            mock({
                '.eslintrc': '{"foo": "bar"}'
            });

            var config = util.getConfig('eslint', './test', null, true);
            expect(config.foo).toBe('bar');
            mock.restore();
        });

        it('no lookup', function () {
            var config = util.config;

            expect(util.getConfig('eslint', false, {})).toEqual(config.eslint);
            expect(util.getConfig('esformatter', false, {})).toEqual(config.esformatter);
            expect(util.getConfig('lesslint', false, {})).toEqual(config.lesslint);
            expect(util.getConfig('htmlcs', false, {})).toEqual(config.htmlcs);
            expect(util.getConfig('csscomb', false, {})).toEqual(config.csscomb);
            expect(util.getConfig('csshint', false, {})).toEqual(config.csshint);

            expect(util.getConfig('unknown', false, {})).toEqual({});

        });

    });

    describe('buildPattern', function () {

        var matchers = {
            toBePath: function () {
                return {
                    compare: function (actual, expected) {
                        var value = actual.replace(/\\/g, '/');

                        return {
                            pass: value === expected,
                            message: 'Expected ' + expected + ' but saw ' + value + '.'
                        };
                    }
                };
            }
        };

        beforeEach(function () {
            jasmine.addMatchers(matchers);
        });

        it('default options', function () {
            var patterns = util.buildPattern();

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toBePath('lib/**/*.{js,jsx,es,es6,css,less,htm,html}');
        });

        it('js only', function () {
            var patterns = util.buildPattern([], 'js');

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toBePath('lib/**/*.{js,jsx,es,es6}');
        });

        it('es only', function () {
            var patterns = util.buildPattern([], 'es');

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toBePath('lib/**/*.es');
        });

        it('not exists dirs', function () {
            var patterns = util.buildPattern(['foo', 'bar', 'baz/foo'], 'js');

            expect(patterns.length).toEqual(4);
            expect(patterns[0]).toEqual('foo');
        });

        it('exists dirs', function () {
            var patterns = util.buildPattern(['cli', 'lib', 'index.js', 'package.json'], 'js');

            expect(patterns.length).toEqual(5);
            expect(patterns[0]).toBePath('cli/**/*.{js,jsx,es,es6}');
            expect(patterns[1]).toBePath('lib/**/*.{js,jsx,es,es6}');
            expect(patterns[2]).toEqual('index.js');
            expect(patterns[3]).toEqual('package.json');
            expect(patterns[4]).toBePath('!**/{node_modules,bower_components}/**');
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
            expect(patterns[0]).toBePath('./**/*.{js,jsx,es,es6,css,less,htm,html}');

            mock.restore();
        });

        it('invalid files', function () {
            mock({
                'test/foo.bar': ''
            });

            var patterns = util.buildPattern(['test/foo.bar'], 'js');
            expect(patterns.length).toEqual(2);

            mock.restore();
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

    it('extend - deep copy', function () {
        var foo = {foo: 1, bar: {b: 1}, baz: {a: 1}};
        var bar = {foo: {bar: 2, baz: 3}, bar: {a: 1}, baz: 1};

        var foobar = util.extend(foo, bar);

        expect(foobar.foo.bar).toBe(bar.foo.bar);
        expect(foobar.foo.baz).toBe(bar.foo.baz);

        expect(foobar.bar.a).toBe(bar.bar.a);
        expect(foobar.bar.b).toBe(foo.bar.b);

        expect(foobar.baz.a).toBe(foo.baz.a);

        bar.foo.bar++;
        expect(foobar.foo.bar).toBe(bar.foo.bar - 1);
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

    describe('mapStrem', function () {
        beforeEach(function () {
            mock({'/test/foo': 'foo', '/test/bar': 'bar'});
        });

        afterEach(function () {
            mock.restore();
        });

        it('transform & flush', function (done) {
            var count = 0;
            fs.src(['/test/**'], {allowEmpty: true})
                .pipe(util.mapStream(function (file, cb) {
                    file.foobar = true;
                    count++;
                    cb(null, file);
                }))
                .pipe(util.mapStream(function (file, cb) {
                    expect(file.foobar).toBeTruthy();
                    cb(null, file);
                }, function () {
                    expect(count).toBe(3);
                }))
                .on('end', function () {
                    expect(count).toBe(3);
                    done();
                });
        });
    });

    describe('AST Helper', function () {
        var eslint = require('eslint').linter;
        var config = {parser: 'babel-eslint'};
        var filename = 'test.js';

        describe('variablesInScope', function () {
            afterEach(function () {
                eslint.reset();
            });

            var variablesInScope = util.variablesInScope;

            it('In upper scope', function () {
                var code = 'let a = [];function foo(){a.push(2);}';

                eslint.on('CallExpression', function (node) {
                    expect(node.callee.type).toBe('MemberExpression');
                    expect(node.callee.object.name).toBe('a');
                    expect(node.callee.property.name).toBe('push');
                    expect(node.arguments.length).toBe(1);
                    expect(node.arguments[0].value).toBe(2);

                    var variable;
                    var finder = function (item) {
                        if (item.name === 'a') {
                            variable = item;
                        }
                        return variable;
                    };

                    var noA = !eslint.getScope().variables.some(finder);
                    var hasA = variablesInScope(eslint).some(finder);

                    expect(noA).toBeTruthy();
                    expect(hasA).toBeTruthy();
                    expect(variable.scope.type).toBe('module');
                });

                eslint.verify(code, config, filename, true);
            });

            it('In current scope', function () {
                var code = 'let a = {};\nfunction foo(){\nlet a = [];\na.push(2);\n}';

                eslint.on('CallExpression', function (node) {
                    expect(node.callee.type).toBe('MemberExpression');
                    expect(node.callee.object.name).toBe('a');
                    expect(node.callee.property.name).toBe('push');
                    expect(node.arguments.length).toBe(1);
                    expect(node.arguments[0].value).toBe(2);

                    var variable;
                    var finder = function (item) {
                        if (item.name === 'a') {
                            variable = item;
                        }
                        return variable;
                    };

                    variablesInScope(eslint).some(finder);

                    expect(!!variable).toBeTruthy();
                    expect(variable.scope.type).toBe('function');
                    expect(variable.defs[0].node.loc.start.line).toBe(3);
                    expect(variable.defs[0].node.init.type).toBe('ArrayExpression');
                });

                eslint.verify(code, config, filename, true);
            });

        });

        describe('isArrayNode', function () {

            afterEach(function () {
                eslint.reset();
            });

            var isArray = util.isArrayNode(eslint);

            it('ArrayExpression', function () {
                var code = 'let a = [];';

                eslint.on('ArrayExpression', function (node) {
                    expect(isArray(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });

            it('NewExpression and callee name end with `Array`', function () {
                var code = ''
                    + 'let a = new Array();'
                    + 'let b = new Int8Array();'
                    + 'let c = new Float32Array();';

                eslint.on('NewExpression', function (node) {
                    expect(isArray(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });

            it('CallExpression truthy case', function () {
                var code = ''
                    + 'let a = Array();'
                    + 'let b = Array.from(foo);'
                    + 'let c = Array.of(1, 2, 3);'
                    + 'let d = c.slice();'
                    + 'let e = Array . prototype.slice.call([1, 2, 3]);'
                    + 'let f = Array.apply(null, [1, 2, 3]);'
                    + 'let f = [1, 2].map(map);';

                eslint.on('CallExpression', function (node) {
                    expect(isArray(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });

            it('CallExpression falsy case', function () {
                var code = ''
                    + 'let a = Object("Array.of(1,2)");'
                    + 'let b = [1,2].indexOf(1);'
                    + 'let c = foo();';

                eslint.on('CallExpression', function (node) {
                    expect(isArray(node)).toBeFalsy();
                });

                eslint.verify(code, config, filename, true);
            });


            it('Identifier truthy case', function () {
                var code = ''
                    + 'let a = [1, 2, 3];'
                    + 'let b = a;'
                    + 'let [, ...c] = a;';

                eslint.on('Identifier', function (node) {
                    expect(isArray(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });


            it('Identifier undefined should be falsy', function () {
                var code = ''
                    + 'let a = b;'
                    + 'let c = a;';

                eslint.on('Identifier', function (node) {
                    expect(isArray(node)).toBeFalsy();
                });

                eslint.verify(code, config, filename, true);
            });


            it('Dismatch case should be falsy', function () {
                var code = ''
                    + 'let a = function () {};'
                    + 'let c = a;'
                    + 'let d = Array.prototype;'
                    + 'let [e] = [1]';

                eslint.on('FunctionExpression', function (node) {
                    expect(isArray(node)).toBeFalsy();
                });

                eslint.on('Identifier', function (node) {
                    expect(isArray(node)).toBeFalsy();
                });

                eslint.on('MemberExpression', function (node) {
                    expect(isArray(node)).toBeFalsy();
                });

                eslint.verify(code, config, filename, true);
            });


            it('Rewrite by self', function () {
                var code = ''
                    + 'let data = foo();'
                    + 'data = data;';

                eslint.on('Identifier', function (node) {
                    if (node.name === 'data') {
                        expect(isArray(node)).toBeFalsy();
                    }
                });

                eslint.verify(code, config, filename, true);
            });


            it('Rewrite by self method', function () {
                var code = ''
                    + 'let data = foo();'
                    + 'data = data.slice(0, index).concat(data.slice(index));';

                eslint.on('Identifier', function (node) {
                    if (node.name === 'data') {
                        expect(isArray(node)).toBeTruthy();
                    }
                });

                eslint.verify(code, config, filename, true);
            });


        });

        describe('isObjectNode', function () {
            afterEach(function () {
                eslint.reset();
            });

            var isObject = util.isObjectNode(eslint);

            it('ObjectExpression', function () {
                var code = 'let a = [];';

                eslint.on('ObjectExpression', function (node) {
                    expect(isObject(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });

            it('NewExpression and callee name not end with `Array`', function () {
                var code = ''
                    + 'let a = new Object();'
                    + 'let b = new String("foo");'
                    + 'let c = new HelloWorld();';

                eslint.on('NewExpression', function (node) {
                    expect(isObject(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });

            it('CallExpression truthy case', function () {
                var code = ''
                    + 'let a = Object();'
                    + 'let b = Object.create(foo);'
                    + 'let c = Object.assign(foo, bar);';

                eslint.on('CallExpression', function (node) {
                    expect(isObject(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });

            it('CallExpression falsy case', function () {
                var code = ''
                    + 'let a = Object.keys(Number.prototype);'
                    + 'let b = Object.values(Number.prototype);'
                    + 'let c = foo();';

                eslint.on('CallExpression', function (node) {
                    expect(isObject(node)).toBeFalsy();
                });

                eslint.verify(code, config, filename, true);
            });


            it('Identifier truthy case', function () {
                var code = ''
                    + 'let a = {};'
                    + 'let b = a;'
                    + 'let {...c} = a;';

                eslint.on('Identifier', function (node) {
                    expect(isObject(node)).toBeTruthy();
                });

                eslint.verify(code, config, filename, true);
            });


            it('Identifier undefined should be falsy', function () {
                var code = ''
                    + 'let a = b;'
                    + 'let c = a;'
                    + 'let {d} = a;';

                eslint.on('Identifier', function (node) {
                    expect(isObject(node)).toBeFalsy();
                });

                eslint.verify(code, config, filename, true);
            });


            it('Dismatch case should be falsy', function () {
                var code = ''
                    + 'let a = function () {};'
                    + 'let c = a;'
                    + 'let d = Object.prototype.toString;'
                    + 'let {e} = {e: 1}';

                eslint.on('FunctionExpression', function (node) {
                    expect(isObject(node)).toBeFalsy();
                });

                eslint.on('Identifier', function (node) {
                    expect(isObject(node)).toBeFalsy();
                });

                eslint.on('MemberExpression', function (node) {
                    expect(isObject(node)).toBeFalsy();
                });

                eslint.verify(code, config, filename, true);
            });

            it('Rewrite by self', function () {
                var code = ''
                    + 'let data = foo();'
                    + 'data = data';

                eslint.on('Identifier', function (node) {
                    if (node.name === 'data') {
                        expect(isObject(node)).toBeFalsy();
                    }
                });

                eslint.verify(code, config, filename, true);
            });

        });

    });
});
