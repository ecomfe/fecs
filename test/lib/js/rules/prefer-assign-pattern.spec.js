/**
 * @file Tests for prefer-assign-pattern
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-assign-pattern');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-assign-pattern', rule, {
    valid: [
        'let foo = bar',
        'foo = 1',
        'foo = "bar"',
        'foo.bar = 1',
        'let foo = {};foo.bar = 1',
        'function foo(a) { a = {...a, b};}',
        'let foo = {};if (!foo) {foo = 1}',
        'let foo = {};if (bar) {foo = "bar";}if (!foo) {foo = 1}',
        'let foo = {};if (foo) {foo = 1}',
        'let foo = {};if (foo) {foo.bar = 1}',
        'function foo(a) {a = a < 0 ? 0 : a;}',
        'function foo(a) {if(foobar) a = 1;}',
        'function foo(a) {a = b && 0;}',
        'function foo(a) {a = b || 0;}',
        'a = a || "foo"',
        'let a;a = a || "foo"',
        'let {foo: {a}} = b;if (!!a) {a = "foo";}',
        'let {foo: {a}} = b;if (true) {a = "foo";}',
        'let {foo: {a}} = b;if(foo.a) {a = "bar"} if (!a) {a = "foo";}',
        'let {foo: {a}} = b;while (true) {a = "foo";break;}',
        'function foo(a) { if (!a) a = `1${bar}`;}',
        'function foo(a) { if (!a) a = Object.create(bar);}',
        'function foo(a) { if (!a) a = new Array(bar);}',
        'function foo(a) { if (!a) a = [bar];}',
        'function foo(a) { a = [bar];}'
    ],
    invalid: [
        {
            code: 'function foo(a) { a = "foo";}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'function foo(a) { a = a || "foo";}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'function foo(a) { a = a ? a : "foo";}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'function foo(a) { a = a == null ? "foo" : a;}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'function foo(a) { a = a == void 0 ? "foo" : a;}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'function foo(a) { if (!a) a = "foo";}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'function foo(a) { if (a == null) a = "foo";}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'function foo(a) { if (a === void 0) a = "foo";}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'let {a} = b;if (!a) a = "foo";',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'let [a] = b;if (!a) a = "foo";',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'let [{a}] = b;if (!a) a = "foo";',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'let {foo: {a}} = b;if (!a) a = {foo: "foo"};',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        },
        {
            code: 'let {foo: {a}} = b;if (!a) {a = ["foo"];}',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Enforce to use AssignmentPattern for `a`.'
                }
            ]
        }
    ]
});
