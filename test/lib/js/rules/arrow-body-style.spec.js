/**
 * @fileoverview Tests for arrow-body-style
 * @author Alberto Rodríguez
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/arrow-body-style');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('arrow-body-style', rule, {
    valid: [
        'var foo = () => 0;',
        'var addToB = (a) => { b =  b + a };',
        'var foo = (retv, name) => {\nretv[name] = true;\nreturn retv;\n};',
        'var foo = () => { bar(); };',
        'var foo = () => { b = a };',
        'let foo = () => {};',
        'var foo = () => { /* do nothing */ };',
        {
            code: 'var foo = () => { return {}; };',
            options: [
                'as-needed',
                {
                    ObjectExpression: true
                }
            ]
        },
        {
            code: 'var foo = () => { return 0; };',
            options: ['always']
        },
        {
            code: 'var foo = () => { return bar(); };',
            options: ['always']
        },
        {
            code: 'var foo = () => ({});',
            options: [
                'as-needed',
                {
                    ObjectExpression: true
                }
            ]
        },
        {
            code: 'var foo = () => ({});',
            options: ['always']
        }
    ],
    invalid: [
        {
            code: 'var foo = () => { bar: 1 };',
            errors: [
                {
                    line: 1,
                    type: 'ArrowFunctionExpression',
                    message: 'Expected block statement surrounding arrow body.'
                }
            ]
        },
        {
            code: 'var foo = () => 0;',
            options: ['always'],
            errors: [
                {
                    line: 1,
                    column: 17,
                    type: 'ArrowFunctionExpression',
                    message: 'Expected block statement surrounding arrow body.'
                }
            ]
        },
        {
            code: 'var foo = () => { return 0; };',
            options: ['as-needed'],
            errors: [
                {
                    line: 1,
                    column: 17,
                    type: 'ArrowFunctionExpression',
                    message: 'Unexpected block statement surrounding arrow body.'
                }
            ]
        },
        {
            code: 'var foo = () => { return bar(); };',
            options: ['as-needed'],
            errors: [
                {
                    line: 1,
                    column: 17,
                    type: 'ArrowFunctionExpression',
                    message: 'Unexpected block statement surrounding arrow body.'
                }
            ]
        }
    ]
});
