/**
 * @file Tests for valid-var-jsdoc.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/valid-var-jsdoc');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('valid-var-jsdoc', rule, {

    valid: [
        'var foo;',
        'var [foo] = bar;',
        'const foo = 1;',
        'var foo = 1;',
        'const FOO = 1;',
        'const FOO_BAR = 1;',
        'const F3_BAR = 1;',
        'var isFoo = true;',
        'var hasFoo = false;',
        '/**\n * isFoo\n * @type {boolean}\n */\nvar isFoo = true;',
        '/**\n * hasFoo\n * @type {boolean}\n */\nvar hasFoo = false;',
        'var FOO = 1;',
        'var Foo = {BAR: 1, BAZ: 2}',
        'var Foo = function () {}',
        '/**\n * foo\n * @const {number}\n */\nconst FOO = 1;',
        '/**\n * foo\n * @namespace\n */\nvar foo = {};',
        '/**\n * fooBar\n * @namespace\n */\nvar fooBar = {};',
        '/**\n * Foo\n * @enum {number}\n */\nconst Foo = {BAR: 1, BAZ: 2};',

        // more then one blank line before statement
        '/**\n * foo\n * @const\n */\n\nconst F2_B_OOBAR = 1;',

        // error from valid-jsdoc, not valid-var-jsdoc
        '/**\n * foo\n * @const\n * @type {number\n */\nconst FOO = 1;'
    ],

    invalid: [
        {
            code: '/**\n * Validate result\n * @type {boolean}\n */\nvar valid = validate()',
            errors: [{
                message: 'Expected boolean variables with `is` or `has` prefix.baidu036',
                type: 'Identifier'
            }]
        },
        {
            code: '/**\n * Foo\n * @enum {number}\n */\nvar foo = {BAR: 1, BAZ: 2}',
            errors: [{
                message: 'Enumerable variables should be named as `Pascal`.baidu031',
                type: 'Identifier'
            }]
        },
        {
            code: 'var Foo = {BAR: 1, baz: 2}',
            errors: [{
                message: 'Property key of enum object should be named as constant variable.baidu031',
                type: 'Property'
            }]
        },
        {
            code: '/**\n * foo\n * @namespace\n */\nvar Foo = {};',
            errors: [{
                message: 'Namespace should be named as `Camel`.baidu032',
                type: 'Identifier'
            }]
        },
        {
            code: '/**\n * foo\n * @const {number}\n */\nconst foo = 1;',
            errors: [{
                message: 'Identifier `foo` should be only uppercase and underscore.baidu026',
                type: 'Identifier'
            }]
        },
        {
            code: '/**\n * foo\n * @const\n */\nconst F2_B_OOBAR = 1;',
            errors: [{
                message: 'Constant variables should be tagged with description, @const and @type.baidu060',
                type: 'Identifier'
            }]
        }
    ]
});
