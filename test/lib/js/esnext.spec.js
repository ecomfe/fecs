
var util = require('../../../lib/util');
var esnext = require('../../../lib/js/esnext');

describe('esnext', function () {

    var config = util.getConfig('eslint');
    var ESNEXT_RULES = [
        'fecs-jsx-var', 'arrow-parens', 'arrow-spacing', 'constructor-super', 'generator-star-spacing',
        'no-arrow-condition', 'no-class-assign', 'no-const-assign', 'no-dupe-class-members', 'no-this-before-super',
        'no-var', 'object-shorthand'
    ];

    var isOpen = function (option) {
        return (typeof option === 'number' ? option : option[0]) > 0
    };

    it('basic parse', function () {
        var sourceCode = esnext.parse('var foo = true', config);

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(isOpen(config.rules[name])).toBe(false);
            }
        });
    });


    it('next', function () {
        var sourceCode = esnext.parse('class foo {}', config);

        expect(sourceCode.text).toBeDefined();
        expect(sourceCode.ast).toBeDefined();

        ESNEXT_RULES.forEach(function (name) {
            if (name in config.rules) {
                expect(isOpen(config.rules[name])).toBe(true);
            }
        });

        expect(config).toBeDefined();
    });

});
