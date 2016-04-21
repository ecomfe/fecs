/**
 * @file Check `Super` callings.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/valid-super');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('valid-super', rule, {

    valid: [
        'let foo = {bar() {}}',
        'class Foo extends Bar {constructor() {super()}}',
        'class Foo extends Bar {bar() {super.bar()}}',
        'class Foo extends Bar {bar() {super.baz()}}',
        'let bar = true;class Foo extends Bar {[bar]() {super.baz()}}'
    ],

    invalid: [
        {
            code: 'class Foo {bar() {super()}}',
            errors: [{
                message: 'Invalid `super`.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'let bar = true;class Foo {[bar]() {super.bar()}}',
            errors: [{
                message: 'Invalid `super`.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'class Foo extends null {bar() {super()}}',
            errors: [{
                message: 'Invalid `super`.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'class Foo extends Bar {bar() {super()}}',
            errors: [{
                message: 'Expected `super.bar` but found `super`.',
                type: 'CallExpression'
            }]
        }
    ]
});
