/**
 * @file Check method definition.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/use-method-definition');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('use-method-definition', rule, {

    valid: [
        'let foo = {bar: {}}',
        'let foo = {bar() {}}',
        'let foo = {["bar"]() {}}',
        'class Foo {bar() {}}',
        'class Foo extends Bar {bar() {}}',
        'class Foo extends null {["bar"]() {}}'
    ],

    invalid: [
        {
            code: 'let foo = {bar: function () {}}',
            errors: [{
                message: 'Expected MethodDefinition but saw FunctionExpression.',
                type: 'Property'
            }]
        },
        {
            code: 'Foo.prototype = {bar: function () {}}',
            errors: [{
                message: 'Expected MethodDefinition but saw FunctionExpression.',
                type: 'Property'
            }]
        }
    ]
});
