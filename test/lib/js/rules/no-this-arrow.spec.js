/**
 * @file Tests for no-this-arrow
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-this-arrow');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-this-arrow', rule, {
    valid: [
        'let foo = {bar: () => {}};foo.bar.baz.call(null)',
        'let foo = {baz: {bar: () => {}}};foo.bar.baz.call(null)',
        'let foo = {baz() {this.a = true;baz(() => {this.a = false;})}}',
        'function foo() {}foo.apply(null)',
        'let bar = () => {};foo.apply(null)',
        'foo.apply(null)',
        'foo.call(null)',
        'foo().call(null)'
    ],
    invalid: [
        {
            code: 'let foo = () => {};foo.call(null)',
            errors: [
                {
                    line: 1,
                    type: 'ArrowFunctionExpression',
                    message: 'Disallow to use arrow function expression within `this` context.'
                }
            ]
        },
        {
            code: 'let foo = {bar: () => {}};foo.bar.call(null)',
            errors: [
                {
                    line: 1,
                    type: 'ArrowFunctionExpression',
                    message: 'Disallow to use arrow function expression within `this` context.'
                }
            ]
        },
        {
            code: 'let foo = {bar: {baz: () => {}}};foo.bar.baz.call(null)',
            errors: [
                {
                    line: 1,
                    type: 'ArrowFunctionExpression',
                    message: 'Disallow to use arrow function expression within `this` context.'
                }
            ]
        }
    ]
});
