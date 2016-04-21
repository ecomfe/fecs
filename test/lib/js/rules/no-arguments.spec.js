/**
 * @file Check arguments.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-arguments');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-arguments', rule, {

    valid: [
        'function foo(...bar) {}',
        'array.map((...args) => args[0])',
        'var foo = function (fooo, ...bar) {}',
        'foo.arguments()',
        'foo.arguments.bar()'
    ],

    invalid: [
        {
            code: 'array.map(() => arguments[0])',
            errors: [{
                message: 'Expected `...args` but found `arguments`.',
                type: 'Identifier'
            }]
        },
        {
            code: 'function foo() {arguments;}',
            errors: [{
                message: 'Expected `...args` but found `arguments`.',
                type: 'Identifier'
            }]
        },
        {
            code: 'function foo() {arguments.length;}',
            errors: [{
                message: 'Expected `...args` but found `arguments`.',
                type: 'Identifier'
            }]
        },
        {
            code: 'function foo() {[].slice.call(arguments);}',
            errors: [{
                message: 'Expected `...args` but found `arguments`.',
                type: 'Identifier'
            }]
        },
        {
            code: 'var foo = function () {arguments;}',
            errors: [{
                message: 'Expected `...args` but found `arguments`.',
                type: 'Identifier'
            }]
        }
    ]
});
