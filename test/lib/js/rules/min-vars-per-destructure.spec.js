/**
 * @file Tests for min-vars-per-destructure
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/min-vars-per-destructure');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('min-vars-per-destructure', rule, {
    valid: [
        'let [a, b] = c;',
        'let [a,,, ...b] = c;',
        'let [a, b, c] = d;',
        'let {a, b} = c;',
        'let {a, b = 1} = c;',
        'let {a, b, c} = d;',
        'let {a: {b}, c: [d]} = e;',
        'let {a: {b}, c: [{d}, e, {f}]} = g;',
        'function foo({a}) {}',
        'var foo = function ({a}) {}',
        'foo(({a}) => a)'
    ],
    invalid: [
        {
            code: 'let {a: {b = 1}} = c;',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (1). Minimum allowed is 2.'
                }
            ]
        },
        {
            code: 'let {a} = c;',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (1). Minimum allowed is 2.'
                }
            ]
        },
        {
            code: 'let [a] = b;',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (1). Minimum allowed is 2.'
                }
            ]
        },
        {
            code: 'let {a, b} = c;',
            options: [3],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (2). Minimum allowed is 3.'
                }
            ]
        },
        {
            code: 'let [a, b] = c;',
            options: [3],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (2). Minimum allowed is 3.'
                }
            ]
        },
        {
            code: 'let {a: {b}} = c;',
            options: [3],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (1). Minimum allowed is 3.'
                }
            ]
        },
        {
            code: 'let [a, {b: [c, {d: [e]}]}] = f;',
            options: [4],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (3). Minimum allowed is 4.'
                }
            ]
        },
        {
            code: 'let {a, b: [c, d, {e}]} = f;',
            options: [5],
            errors: [
                {
                    line: 1,
                    type: 'VariableDeclarator',
                    message: 'Not enough variables declared during destructuring (4). Minimum allowed is 5.'
                }
            ]
        }
    ]
});
