
var util = require('../../../lib/util');
var esnext = require('../../../lib/js/esnext');

var getValue = function (actual) {
    return typeof actual === 'number' ? actual : actual[0];
};

var matchers = {
    toBeOpen: function () {
        return {
            compare: function (actual) {
                var value = getValue(actual);
                return {
                    pass: value > 0,
                    message: 'Expected ' + value + ' greater then 0.'
                };
            }
        };
    },
    toBeClose: function () {
        return {
            compare: function (actual) {
                var value = getValue(actual);
                return {
                    pass: value === 0,
                    message: 'Expected ' + value + ' equal 0.'
                };
            }
        };
    }
};

describe('esnext', function () {

    beforeEach(function() {
        jasmine.addMatchers(matchers);
    });

    var config = util.getConfig('eslint');
    var ESNEXT_RULES = esnext.ESNEXT_RULES;

    it('remove shebang', function () {
        var sourceCode = esnext.parse('#!/path/to/bin command', config);

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        expect(sourceCode.ast.body.length).toBe(0);
    });

    it('remove shebang', function () {
        var sourceCode = esnext.parse('#!/path/to/bin command\nvar foo = true;', config);

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        expect(sourceCode.ast.comments.length).toBe(0);
        expect(sourceCode.ast.body[0].leadingComments.length).toBe(0);
    });

    it('hack for `fecs-import-on-top`', function () {
        var parse = function () {
            esnext.parse(
                'function foo() {\n    import bar from \'bar\';\n    return bar;\n}',
                config
            );
        };

        expect(parse).toThrow();

        try {
            parse();
        }
        catch (e) {
            expect(e.rule).toBe('fecs-import-on-top');
        }
    });

    it('es6-', function () {
        var sourceCode = esnext.parse('var foo = true', config);

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeClose();
            }
        });
    });


    it('es-next', function () {
        var sourceCode = esnext.parse('class foo {}', config);

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeOpen();
            }
        });
    });


    it('es-next by file extension', function () {
        var sourceCode = esnext.parse('var foo = true', config, '/path/to/file.es');

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeOpen();
            }
        });
    });


    it('es-next with generator', function () {
        var sourceCode = esnext.parse('function* foo() {}', config, '/path/to/file.js');

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeOpen();
            }
        });
    });

    describe('es-next special properties', function () {

        it('shorthand', function () {
            var sourceCode = esnext.parse('let x = 1;\nlet foo = {x};', config);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

        it('computed', function () {
            var sourceCode = esnext.parse('let x = 1;\nlet foo = {[x+1]: 2};', config);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

        it('method', function () {
            var sourceCode = esnext.parse('let foo = {bar(){}};', config);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

    });

    describe('env.es6', function () {

        it('es6-', function () {
            var options = util.mix(config, {env: {es6: false}});
            var sourceCode = esnext.parse('class foo {}', options);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeClose();
                }
            });
        });

        it('es-next', function () {
            var options = util.mix(config, {env: {es6: true}});
            var sourceCode = esnext.parse('var foo = true', options);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

    });

    describe('ecmaFeatures', function () {

        it('es6- when none field', function () {
            var options = util.mix(config, {ecmaFeatures: {}});
            var sourceCode = esnext.parse('class foo {}', options);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeClose();
                }
            });
        });

        it('es6- when no true field', function () {
            var options = util.mix(
                config,
                {
                    ecmaFeatures: {
                        classes: false,
                        spread: false,
                        newTarget: false
                    }
                }
            );
            var sourceCode = esnext.parse('class foo {}', options);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeClose();
                }
            });
        });

        it('es-next', function () {
            var options = util.mix(
                config,
                {
                    ecmaFeatures: {
                        classes: true,
                        spread: false,
                        newTarget: false
                    }
                }
            );
            var sourceCode = esnext.parse('var foo = true', options);

            expect(sourceCode.text).toBeDefined();
            expect(sourceCode.ast).toBeDefined();

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

    });

});
