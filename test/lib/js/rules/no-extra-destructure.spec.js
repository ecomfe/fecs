/**
 * @file Tests for no-extra-destructure
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-extra-destructure');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-extra-destructure', rule, {
    valid: [
        'let a;',
        'for (let a in b) {};',
        'for (let a of b) {};',
        '[a] = b;',
        '[a, b] = c;',
        'let [a] = b;',
        'let [a, b] = c;',
        'let {a: [b]} = c;',
        'let {a, b} = c;',
        'let [a, b] = [b, a];',
        'let [a, b, c] = [c, a, b];',
        'let [a, {b, c}] = [d, e];',
        'let {a, b} = {c, ...d};',
        'let [a, b,...c] = [d, e, ...f];',
        'let {a, ...b} = {c, ...d};'
    ],
    invalid: [
        {
            code: 'let [a,, b] = [1,2,3];',
            errors: [
                {
                    line: 1,
                    column: 6,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                },
                {
                    line: 1,
                    column: 10,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                }
            ]
        },
        {
            code: 'let {a, b} = {b, a};',
            errors: [
                {
                    line: 1,
                    column: 6,
                    type: 'Property',
                    message: 'Unnecessary destructure.'
                },
                {
                    line: 1,
                    column: 9,
                    type: 'Property',
                    message: 'Unnecessary destructure.'
                }
            ]
        },
        {
            code: 'let {a} = {1: 0};',
            errors: [
                {
                    line: 1,
                    type: 'Property',
                    message: 'Unnecessary destructure.'
                }
            ]
        },
        {
            code: 'let [a] = [1];',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                }
            ]
        },
        {
            code: 'let [a, b] = [1, 2];',
            errors: [
                {
                    line: 1,
                    column: 6,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                },
                {
                    line: 1,
                    column: 9,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                }
            ]
        },
        {
            code: '[a, b] = [1, 2];',
            errors: [
                {
                    line: 1,
                    column: 2,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                },
                {
                    line: 1,
                    column: 5,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                }
            ]
        },
        {
            code: 'let [a, b] = [a, b];',
            errors: [
                {
                    line: 1,
                    column: 6,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                },
                {
                    line: 1,
                    column: 9,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                }
            ]
        },
        {
            code: 'let [a, b, c] = [b, a, c];',
            errors: [
                {
                    line: 1,
                    column: 12,
                    type: 'Identifier',
                    message: 'Unnecessary destructure.'
                }
            ]
        }
    ]
});
