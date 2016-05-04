/**
 * @file Tests for max-calls-in-template
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/max-calls-in-template');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('max-calls-in-template', rule, {
    valid: [
        'let foo = `foo`;',
        'let foo = `foo ${bar}`;',
        'let foobar = `${foo()} bar`',
        'fo(`${foo}-bar`)',
        'let foobar = `${foo} ${bar}`;',
        'let foobar = `${foo()} ${bar()}`;'
    ],
    invalid: [
        {
            code: 'let foobar = `${foo(bar())}`;',
            errors: [
                {
                    line: 1,
                    type: 'TemplateLiteral',
                    message: 'Too many nest function calls (2). Maximum allowed is 1.'
                }
            ]
        },
        {
            code: 'f(`${foo(bar())}`);',
            errors: [
                {
                    line: 1,
                    type: 'TemplateLiteral',
                    message: 'Too many nest function calls (2). Maximum allowed is 1.'
                }
            ]
        },
        {
            code: 'f(`${foo(bar(baz()), baz())}`);',
            options: [2],
            errors: [
                {
                    line: 1,
                    type: 'TemplateLiteral',
                    message: 'Too many nest function calls (3). Maximum allowed is 2.'
                }
            ]
        }
    ]
});
