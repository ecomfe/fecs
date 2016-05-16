/**
 * @file Tests for prefer-spread-element
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-spread-element');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-spread-element', rule, {
    valid: [
        'let foo = [...foo, newValue];',
        'let foo = [...foo, ...bar];',
        'let otherArr = Array.from(arr);',
        'let foo = foo.concat(1);',
        'let foo = foo.concat(bar());',
        {
            code: 'let otherArr = [...arr];',
            options: [{copy: true}]
        }
    ],
    invalid: [
        {
            code: 'let foo = foo.concat(newValue);',
            errors: [
                {
                    line: 1,
                    type: 'CallExpression',
                    message: 'Expected to use SpreadElement to concat Array.'
                }
            ]
        },
        {
            code: 'let foo = foo.concat(Object.keys(bar));',
            errors: [
                {
                    line: 1,
                    type: 'CallExpression',
                    message: 'Expected to use SpreadElement to concat Array.'
                }
            ]
        },
        {
            code: 'let foo = foo.concat([1,2,3]);',
            errors: [
                {
                    line: 1,
                    type: 'CallExpression',
                    message: 'Expected to use SpreadElement to concat Array.'
                }
            ]
        },
        {
            code: 'let foo = foo.concat(Array(1,2,3));',
            errors: [
                {
                    line: 1,
                    type: 'CallExpression',
                    message: 'Expected to use SpreadElement to concat Array.'
                }
            ]
        },
        {
            code: 'let foo = foo.concat(new Array(1,2,3));',
            errors: [
                {
                    line: 1,
                    type: 'CallExpression',
                    message: 'Expected to use SpreadElement to concat Array.'
                }
            ]
        },
        {
            code: 'let foo = foo.concat(Array.from(bar));',
            errors: [
                {
                    line: 1,
                    type: 'CallExpression',
                    message: 'Expected to use SpreadElement to concat Array.'
                }
            ]
        },
        {
            code: 'let otherArr = [...arr];',
            errors: [
                {
                    line: 1,
                    type: 'SpreadElement',
                    message: 'Expected to use `Array.from` to copy Array.'
                }
            ]
        },
        {
            code: 'let otherArr = [...arr];',
            options: [{copy: false}],
            errors: [
                {
                    line: 1,
                    type: 'SpreadElement',
                    message: 'Expected to use `Array.from` to copy Array.'
                }
            ]
        }
    ]
});
