/**
 * @file Check `Super` callings.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-super');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-super', rule, {

    valid: [
        'function foo() {}foo()',
        'var foo = function () {};foo()',
        'class Foo {bar() {}}',
        'class Foo extends Bar {bar() {}}',
        'class Foo extends Bar {bar() {super.bar()}}',
        'class Foo extends null {bar() {}}'
    ],

    invalid: [
        {
            code: 'class Foo extends Bar{bar() {Bar.prototype.bar.call(this)}}',
            errors: [{
                message: 'Use `super` call instead.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'class Foo extends Bar{bar() {Bar.prototype.bar.call(this, true)}}',
            errors: [{
                message: 'Use `super` call instead.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'class Foo extends Bar{bar() {Bar.prototype.bar.apply(this)}}',
            errors: [{
                message: 'Use `super` call instead.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'class Foo extends Bar{bar() {Bar.prototype.bar.apply(this, true)}}',
            errors: [{
                message: 'Use `super` call instead.',
                type: 'CallExpression'
            }]
        }
    ]
});
