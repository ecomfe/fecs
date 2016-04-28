/**
 * @fileoverview Tests for max-destructure-depth
 * @author Alberto Rodríguez
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/max-destructure-depth');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('arrow-body-style', rule, {
    valid: [
        'let {a} = b;',
        'let {a, b} = c;',
        'let {a, b, c} = d;',
        'let {a: {b}} = c;',
        'let {a: {b}, c: {d}} = e;',
        'let {a: {b}, c: {d}, e: {f}} = g;',
        'function foo({a}) {}',
        'function foo({a, b}) {}',
        'function foo({a, b, c}) {}',
        'function foo({a: {b}}) {}',
        'function foo({a: {b}, c: {d}}) {}',
        'function foo({a: {b}, c: {d}, e: {f}}) {}',
        'var foo = function ({a}) {}',
        'var foo = function ({a, b}) {}',
        'var foo = function ({a, b, c}) {}',
        'var foo = function ({a: {b}}) {}',
        'var foo = function ({a: {b}, c: {d}}) {}',
        'var foo = function ({a: {b}, c: {d}, e: {f}}) {}',
        'foo(({a}) => a)',
        'foo(({a, b}) => a[b])',
        'foo(({a, b, c}) => a[b][c])',
        'foo(({a: {b}}) => b)',
        'foo(({a: {b}, c: {d}}) => d)',
        'foo(({a: {b}, c: {d}, e: {f}}) => f)'
    ],
    invalid: [
        {
            code: 'let {a: {b}} = c;',
            options: [1],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (2). Maximum allowed is 1.'
                }
            ]
        },
        {
            code: 'let {a: {b}, c: {d: {e}}} = f;',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (3). Maximum allowed is 2.'
                }
            ]
        },
        {
            code: 'function foo({a: {b}}) {}',
            options: [1],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (2). Maximum allowed is 1.'
                }
            ]
        },
        {
            code: 'function foo({a: {b}, c: {d: {e}}}) {}',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (3). Maximum allowed is 2.'
                }
            ]
        },
        {
            code: 'var foo = function ({a: {b}}) {}',
            options: [1],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (2). Maximum allowed is 1.'
                }
            ]
        },
        {
            code: 'var foo = function ({a: {b}, c: {d: {e}}}) {}',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (3). Maximum allowed is 2.'
                }
            ]
        },
        {
            code: 'foo(({a: {b}}) => b);',
            options: [1],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (2). Maximum allowed is 1.'
                }
            ]
        },
        {
            code: 'foo(({a: {b}, c: {d: {e}}}) => e);',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'ObjectPattern',
                    message: 'Too many nested destructure (3). Maximum allowed is 2.'
                }
            ]
        }
    ]
});
