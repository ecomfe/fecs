/**
 * @file Tests for global declare
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/strict-novar-global');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('novar for global variable', rule, {
    valid: [
        'var foo1 = 2;',
        'var foo2;var foo3; var foo4; foo2 = foo3 = foo4= 2;'
    ],
    invalid: [
        {
            code: 'foo = 1;',
            errors: [
                {
                    line: 1,
                    type: 'ExpressionStatement',
                    message: 'declare global variable without var.'
                }
            ]
        },
        {
            code: 'var foo4;foo6 = 2;',
            errors: [
                {
                    line: 1,
                    type: 'ExpressionStatement',
                    message: 'declare global variable without var.'
                }
            ]
        },
        {
            code: 'var foo4;foo6 = foo4 = 2;',
            errors: [
                {
                    line: 1,
                    type: 'ExpressionStatement',
                    message: 'declare global variable without var.'
                }
            ]
        }
    ]
});
