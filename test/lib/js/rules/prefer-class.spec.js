/**
 * @file Check class definitions.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-class');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-class', rule, {

    valid: [
        'function foo() {}',
        'var foo = function () {}',
        '(function () {})()',
        'class Foo {}',
        'class Foo extends Bar {}',
        'export class Foo{}',
        'export default class {}',
        'export default class Foo extends Bar {}'
    ],

    invalid: [
        {
            code: 'var Foo = function () {}',
            errors: [{
                message: 'Expected `class Foo` but found `FunctionExpression`.',
                type: 'FunctionExpression'
            }]
        },
        {
            code: 'function Foo() {}',
            errors: [{
                message: 'Expected `class Foo` but found `FunctionDeclaration`.',
                type: 'FunctionDeclaration'
            }]
        }
    ]
});
