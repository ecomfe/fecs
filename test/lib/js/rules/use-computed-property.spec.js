/**
 * @file Tests for use-computed-property
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/use-computed-property');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('use-computed-property', rule, {
    valid: [
        'foo = true',
        'foo.bar = true',
        'let foo = {bar: {}};foo.bar.baz = true',
        'let foo = {};[1, 2, 3].forEach((n) => foo[n] = true);',
        'let foo = {};if (bar) foo.bar = true;',
        'function a(foo) {foo[bar] = "foobar"}',
        'function a(foo = {}) {foo[bar] = "foobar"}',
        'let foo = [];foo.bar = "foobar"',
        'let foo = new Foo();foo.bar = "foobar"',
        'let foo = foobar();foo.bar = "foobar"',
        'let foo = Object.create({});foo.bar = "foobar"'
    ],
    invalid: [
        {
            code: 'let foo = {};foo[bar] = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with computed property.'
                }
            ]
        },
        {
            code: 'function a() {let foo = {};foo[bar] = "foobar"}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with computed property.'
                }
            ]
        },
        {
            code: 'let foo = {};foo.bar = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with this property.'
                }
            ]
        },
        {
            code: 'let foo = Object.create(null);foo.bar = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with this property.'
                }
            ]
        },
        {
            code: 'let foo = Object();foo.bar = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with this property.'
                }
            ]
        },
        {
            code: 'let foo = Object({});foo.bar = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with this property.'
                }
            ]
        },
        {
            code: 'let foo = new Object();foo.bar = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with this property.'
                }
            ]
        },
        {
            code: 'let foo = new Object({});foo.bar = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to init `foo` with this property.'
                }
            ]
        }
    ]
});
