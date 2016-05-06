/**
 * @file Check that filename
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/esnext-ext');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

ruleTester.run('esnext-ext', rule, {

    valid: [
        'var a = 123;\n',
        'var a = 123;\r\n',
        {
            code: 'var a = 123;',
            filename: 'foo/bar.js'
        }
    ],

    invalid: [
        {
            code: 'var a = 123;',
            filename: 'foo/bar.es',
            options: ['js'],
            errors: [
                {message: 'Expected file extension `js` but found `es`.baidu602', type: 'Program'}
            ]
        },
        {
            code: 'var a = 123;',
            filename: 'foo/bar.ts',
            options: [['js', 'es']],
            errors: [
                {message: 'Expected file extension `js` or `es` but found `ts`.baidu602', type: 'Program'}
            ]
        },
        {
            code: 'var a = 123;',
            filename: 'foo/bar.es',
            options: [['js', 'es']],
            errors: [
                {message: 'Expected file extension `js` but found `es`.baidu601', type: 'Program'}
            ]
        },
        {
            code: 'var a = 123;',
            filename: 'foo/bar.ts',
            options: ['ts'],
            errors: [
                {message: 'Expected file extension `js` but found `ts`.baidu601', type: 'Program'}
            ]
        },
        {
            code: 'var a = 123;',
            filename: 'foo/bar.ts',
            options: [['ts']],
            errors: [
                {message: 'Expected file extension `js` but found `ts`.baidu601', type: 'Program'}
            ]
        }
    ]
});
