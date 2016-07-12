/**
 * @file Tests for valid-constructor.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/valid-constructor');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('valid-constructor', rule, {

    valid: [
        'foo = {}',
        'foo.bar = {}',
        {
            code: [
                'var F = new Function();',
                'F.prototype = superClass.prototype;',
                'subClass.prototype = new F();',
                'subClass.prototype.constructor = subClass;'
            ].join('\n')
        },
        {
            code: [
                'var protos = {',
                '    constructor: Animal,',
                '    jump: function () {',
                '    }',
                '};',
                'Animal.prototype = protos;'
            ].join('\n')
        },
        {
            code: [
                'Animal.prototype = protos;'
            ].join('\n')
        },
        {
            code: [
                'Animal.prototype = {',
                '    constructor: Animal,',
                '    jump: function () {',
                '    }',
                '};'
            ].join('\n')
        }
    ],

    invalid: [
        {
            code: [
                'var F = new Function();',
                'F.prototype = superClass.prototype;',
                'subClass.prototype = new F();'
            ].join('\n'),
            errors: [{
                message: 'Expected to fix up `constructor` after override `prototype`.baidu110',
                type: 'NewExpression'
            }]
        },
        {
            code: [
                'Animal.prototype = {',
                '    jump: function () {',
                '    }',
                '};'
            ].join('\n'),
            errors: [{
                message: 'Expected to fix up `constructor` after override `prototype`.baidu111',
                type: 'ObjectExpression'
            }]
        }
    ]
});
