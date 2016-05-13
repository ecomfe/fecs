/**
 * @file Tests for use-for-of
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/use-for-of');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('use-for-of', rule, {
    valid: [
        'Object.keys(foo).forEach(bar);',
        'for (var key of Object.keys(foo)) {}',
        'for (let key of Object.keys(foo)) {}',
        'for (let key of foo) {}'
    ],
    invalid: [
        {
            code: 'for (var key in object) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                },
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to use Object.keys.'
                }
            ]
        },
        {
            code: 'for (var key in [1, 2, 3]) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                }
            ]
        },
        {
            code: 'for (var key in Object.keys({foo, bar})) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                }
            ]
        },
        {
            code: 'for (var key in {foo, bar}) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                },
                {
                    line: 1,
                    type: 'ObjectExpression',
                    message: 'Expected to use Object.keys.'
                }
            ]
        },
        {
            code: 'for (var key in foo()) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                },
                {
                    line: 1,
                    type: 'CallExpression',
                    message: 'Expected to use Object.keys.'
                }
            ]
        },
        {
            code: 'for (var key in new Object()) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                },
                {
                    line: 1,
                    type: 'NewExpression',
                    message: 'Expected to use Object.keys.'
                }
            ]
        },
        {
            code: 'for (var key in new Foo()) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                },
                {
                    line: 1,
                    type: 'NewExpression',
                    message: 'Expected to use Object.keys.'
                }
            ]
        },
        {
            code: 'for (var key in Array(1, 2, 3)) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                }
            ]
        },
        {
            code: 'for (var key in new Array(1, 2, 3)) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                }
            ]
        },
        {
            code: 'for (var key in Array.from(foo)) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                }
            ]
        },
        {
            code: 'for (var key in Array.unknown(foo)) {}',
            errors: [
                {
                    line: 1,
                    type: 'ForInStatement',
                    message: 'Unexpected for-in, use for-of instead.'
                }
            ]
        }
    ]
});
