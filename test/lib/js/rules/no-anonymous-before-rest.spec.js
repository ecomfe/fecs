/**
 * @file Tests for no-anonymous-before-rest
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-anonymous-before-rest');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-anonymous-before-rest', rule, {
    valid: [
        'let [a, ...b] = c;',
        'let [a, b, ...c] = d;'
    ],
    invalid: [
        {
            code: 'let [a, b,, ...other] = c;',
            errors: [
                {
                    line: 1,
                    type: 'ArrayPattern',
                    message: 'No anonymous elements (found 1) before rest element.'
                }
            ]
        },
        {
            code: 'let [a,,, ...other] = b;',
            errors: [
                {
                    line: 1,
                    type: 'ArrayPattern',
                    message: 'No anonymous elements (found 2) before rest element.'
                }
            ]
        },
        {
            code: 'let [,,, ...other] = a;',
            errors: [
                {
                    line: 1,
                    type: 'ArrayPattern',
                    message: 'No anonymous elements (found 3) before rest element.'
                }
            ]
        }
    ]
});
