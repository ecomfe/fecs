/**
 * @file Check for-in.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-forin-array');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-forin-array', rule, {

    valid: [
        'for (var key in {foo: true}) {}',
        'var foo = {bar: true};for (var key in foo) {}',
        'for (var key in list) {}',
        'var list;for (var key in list) {}',
        'if (foo) {for (var key in list) {}}',
        'function foo(list) {for (var key in list) {}}',
        'function foo({list}) {for (var key in list) {}}',
        'var foo = function () {for (var key in list) {}}',
        'var foo = () => {for (var key in list) {}}'
    ],

    invalid: [
        {
            code: 'var list = [1, 2, 3];for (var key in list) {}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        {
            code: 'for (var key in [1, 2, 3]) {}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        {
            code: 'for (var key in new Array(1, 2, 3)) {}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        {
            code: 'var list = new Array(1, 2, 3);for (var key in list) {}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        {
            code: 'var list = Array(1, 2, 3);for (var key in list) {}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        {
            code: 'for (var key in Array(1, 2, 3)) {}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        {
            code: 'function foo(...list) {for (var key in list) {}}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        // {
        //     code: 'function foo({list: []}) {for (var key in list) {}}',
        //     errors: [{
        //         message: 'Don\'t traverse Array with for-in.',
        //         type: 'ForInStatement'
        //     }]
        // },
        {
            code: '/**\n * foo\n * @param {Array} list xxx\n */\nvar foo = function (list) {for (var key in list) {}}',
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        },
        {
            code: [
                '/**',
                ' * foo',
                ' * @param {Array} list xxx',
                ' */',
                'function foo(list) {if (list) for (var key in list) {}}'
            ].join('\n'),
            errors: [{
                message: 'Don\'t traverse Array with for-in.',
                type: 'ForInStatement'
            }]
        }
    ]
});
