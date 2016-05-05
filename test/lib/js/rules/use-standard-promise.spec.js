/**
 * @file Tests for use-standard-promise
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/use-standard-promise');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('use-standard-promise', rule, {
    valid: [
        'let p = Promise.all([p1, p2, p3]);',
        'let p = Promise.race([p1, p2, p3]);',
        'let p = promise.any([p1, p2, p3]);',
        {
            code: 'let p = Promise.any([p1, p2, p3]);',
            options: [{any: true}]
        }
    ],
    invalid: [
        {
            code: 'let p = Promise.any([p1, p2, p3]);',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to use standard Promise APIs.'
                }
            ]
        }
    ]
});
