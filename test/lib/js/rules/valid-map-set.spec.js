/**
 * @file Tests for valid-map-set
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/valid-map-set');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('valid-map-set', rule, {
    valid: [
        'let foo = new Map(["name", "foo"], ["title", "bar"])',
        'let foo = new Set(["one", "two", "three"])',
        'let foo = {a: 1, b: 2, c: "foo"}',
        'let foo = new Object();foo.d = 0',
        'let foo = new Object({});foo.d = 0',
        'let foo = new Object(1);bar = {};foo[bar] = "foobar"',
        'let foo = new Object();let a = "a";foo[a] = 0;',
        'let foo = new Object();let a = String(1);foo[a] = 0;',
        'let foo = new Object();let a = bar.toString();foo[a] = 0;',
        'let foo = new Object();foo[a.toString()] = 0;',
        'let foo = new Object();let a = "a" + 1;foo[a] = 0;',
        'let foo = new Object();let a = 1 + "a";foo[a] = 0;',
        'let foo = new Object();let a = new String("a");foo[a] = 0;',
        'let foo = new Object();bar[d] = 0',
        'let foo = {a: 1, b: 2, c: "foo"};foo.d = 0',
        'let foo = new Object({a: 1, b: 2, c: "foo"});foo.d = 0',
        'let o = {};let n = 123;let key = `${n}456`;o[key] = 789;',
        'for (let a in b) {}',
        'let foo = {a: 1, b: {c: 2}};typeof foo.a;delete foo.b.c;',
        'let foo = {a: 1, b: 1, c: "c"};',
        'function foo(name) {let a = {};a[name] = 1;}'
    ],
    invalid: [
        {
            code: 'let foo = {a: true, b: true, c: 1};',
            errors: [
                {
                    line: 1,
                    type: 'ObjectExpression',
                    message: 'Expected to use Set if you need an identify collection.'
                }
            ]
        },
        {
            code: 'let foo = {a: 1, b: 2};\ndelete foo.a;',
            errors: [
                {
                    line: 2,
                    type: 'UnaryExpression',
                    message: 'Expected to use Map or Set if you need to add or remove items.'
                }
            ]
        },
        {
            code: 'for (var a in {}) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Expected to use Map or Set with interation.'
                }
            ]
        },
        {
            code: 'let foo = {};bar = {};foo[bar] = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Map but found Object.'
                }
            ]
        },
        {
            code: 'let foo = Object({}),bar = {};foo[bar] = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Map but found Object.'
                }
            ]
        },
        {
            code: 'let foo = Object();bar = {};foo[bar] = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Map but found Object.'
                }
            ]
        },
        {
            code: 'let foo = Object.create(null);bar = {};foo[bar] = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Map but found Object.'
                }
            ]
        },
        {
            code: 'let foo = new Object();bar = {};foo[bar] = "foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Map but found Object.'
                }
            ]
        },
        {
            code: 'let foo = {};bar = {},baz = [];foo[bar] = "foobar";foo[baz]="foobaz";',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Map but found Object.'
                }
            ]
        },
        {
            code: 'let foo = {};bar = {};foo[bar] = []',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Map but found Object.'
                }
            ]
        },
        {
            code: 'let foo = {};bar = {};foo[bar] = true',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Set but found Object.'
                }
            ]
        },
        {
            code: 'let foo = {};bar = {};foo[bar] = !"foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Set but found Object.'
                }
            ]
        },
        {
            code: 'let foo = {};bar = {};foo[bar] = !!"foobar"',
            errors: [
                {
                    line: 1,
                    type: 'AssignmentExpression',
                    message: 'Expected to use Set but found Object.'
                }
            ]
        }
    ]
});
