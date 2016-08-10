
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

var check = function (code, config, path) {
    var parser = require(config.parser);

    var ast = parser.parse(
        code.replace(/^#!([^\r\n]+)/, '//$1'),
        {
            loc: true,
            range: true,
            raw: true,
            tokens: true,
            comment: true,
            attachComment: true,
            ecmaFeatures: config.ecmaFeatures
        }
    );

    esnext.detect(ast, config, path);
};

describe('esnext', function () {
    var config;
    beforeEach(function () {
        config = util.mix(util.getConfig('eslint'));
        jasmine.addMatchers(matchers);
    });

    var ESNEXT_RULES = esnext.ESNEXT_RULES;

    it('es6-', function () {
        check('var foo = true', config);

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeClose();
            }
        });
    });


    it('es6- when es6+ code after 10 traveser', function () {
        var code = new Array((esnext.MAX_TRAVERSE_TIMES / 2) | 0).join('var foo = 1;\n');

        check(code + '\nclass Foo {}', config);

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeClose();
            }
        });
    });


    it('es-next', function () {
        check('class Foo {}', config);

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeOpen();
            }
        });
    });


    it('es-next by file extension', function () {
        check('var foo = true', config, '/path/to/file.es');

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeOpen();
            }
        });
    });


    it('es-next with generator', function () {
        check('function* foo() {}', config, '/path/to/file.js');

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeOpen();
            }
        });
    });

    describe('es-next special properties', function () {

        it('shorthand', function () {
            check('let x = 1;\nlet foo = {x};', config);

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

        it('computed', function () {
            check('let x = 1;\nlet foo = {[x+1]: 2};', config);

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

        it('method', function () {
            check('let foo = {bar(){}};', config);

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

            // open all rules
            ESNEXT_RULES.forEach(function (name) {
                if (name in options.rules) {
                    if (typeof options.rules[name] === 'number') {
                        options.rules[name] = 2;
                    }
                    else {
                        options.rules[name][0] = 2;
                    }
                }
            });

            check('class Foo {}', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in options.rules) {
                    expect(options.rules[name]).toBeClose();
                }
            });
        });

        it('es-next', function () {
            var options = util.mix(config, {env: {es6: true}});

            // close all rules
            ESNEXT_RULES.forEach(function (name) {
                if (name in options.rules) {
                    if (typeof options.rules[name] === 'number') {
                        options.rules[name] = 0;
                    }
                    else {
                        options.rules[name][0] = 0;
                    }
                }
            });

            check('var foo = true', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in options.rules) {
                    expect(options.rules[name]).toBeOpen();
                }
            });
        });

    });

    describe('ecmaFeatures', function () {

        it('detect es6 by code when none field', function () {
            var options = util.mix(config, {ecmaFeatures: {}});
            check('class Foo {}', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in options.rules) {
                    expect(options.rules[name]).toBeOpen();
                }
            });
        });

        it('detect es6 by code when no true field', function () {
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
            check('class Foo {}', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in options.rules) {
                    expect(options.rules[name]).toBeOpen();
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
            check('var foo = true', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in options.rules) {
                    expect(options.rules[name]).toBeOpen();
                }
            });
        });

    });

    describe('verify proxy', function () {
        var eslint = require('eslint').linter;

        it('esnext.verify should be proxy as eslint.verify', function () {
            var esnextResult = esnext.verify('class Foo {}', config);
            var eslintResult = eslint.verify('class Foo {}', config);

            expect(esnextResult).toEqual(eslintResult);
        });

    });

});
