
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
}

describe('esnext', function () {

    beforeEach(function() {
        jasmine.addMatchers(matchers);
    });

    var config = util.getConfig('eslint');
    var ESNEXT_RULES = esnext.ESNEXT_RULES;

    it('es6-', function () {
        check('var foo = true', config);

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(config.rules[name]).toBeClose();
            }
        });
    });


    it('es-next', function () {
        check('class foo {}', config);

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
            check('class foo {}', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeClose();
                }
            });
        });

        it('es-next', function () {
            var options = util.mix(config, {env: {es6: true}});
            check('var foo = true', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

    });

    describe('ecmaFeatures', function () {

        it('detect es6 by code when none field', function () {
            var options = util.mix(config, {ecmaFeatures: {}});
            check('class foo {}', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
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
            check('class foo {}', options);

            ESNEXT_RULES.forEach(function (name) {
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
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
                if (name in config.rules) {
                    expect(config.rules[name]).toBeOpen();
                }
            });
        });

    });

});
