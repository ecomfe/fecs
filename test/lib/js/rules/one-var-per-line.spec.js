/**
 * @file Tests for one-var-per-line
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/one-var-per-line');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('one-var-per-line', rule, {
    valid: [
        'let [a, b] = c;',
        'let [a,,, ...b] = c;',
        'let [\n    a,\n    ,\n    ,\n    ...b] = c;',
        'let [a, b, c] = d;',
        'let {a, b} = c;',
        'let {a, b, c} = d;',
        'let {a: {b}, c: [d]} = e;',
        'let {a: {b}, c: [{d}, e, {f}]} = g;',
        'let {\n    a,\n    b,\n    c\n} = d;',
        'let [\n    a,\n    b,\n    c\n] = d;',
        'let [\n    a,\n    b,\n    ...c\n] = d;'
    ],
    invalid: [
        {
            code: 'let [a,, \nb] = c;',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'One Variable per line when destructuring.'
                },
                {
                    line: 2,
                    type: 'Identifier',
                    message: 'One Variable per line when destructuring.'
                }
            ]
        },
        {
            code: 'let {a, \nb} = c;',
            errors: [
                {
                    line: 1,
                    type: 'Property',
                    message: 'One Variable per line when destructuring.'
                }
            ]
        },
        {
            code: 'let {a, \nb,c} = c;',
            errors: [
                {
                    line: 1,
                    type: 'Property',
                    message: 'One Variable per line when destructuring.'
                },
                {
                    line: 2,
                    type: 'Property',
                    message: 'One Variable per line when destructuring.'
                }
            ]
        },
        {
            code: 'let {\na, \nb,c} = c;',
            errors: [
                {
                    line: 3,
                    type: 'Property',
                    message: 'One Variable per line when destructuring.'
                }
            ]
        }
    ]
});
