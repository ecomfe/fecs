/**
 * @file Check evals.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-eval');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-eval', rule, {

    valid: [
        '(0, eval)("foo = true")',
        'var foo = eval;foo("bar = true")',
        'var foo = window.eval;foo("bar = true")'
    ],

    invalid: [
        {
            code: 'eval("foo=true")',
            errors: [{
                message: 'Avoid to use eval or window.eval.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'window.eval("foo=true")',
            errors: [{
                message: 'Avoid to use eval or window.eval.',
                type: 'CallExpression'
            }]
        }
    ]
});
