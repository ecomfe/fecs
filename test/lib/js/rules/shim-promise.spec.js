/**
 * @file Tests for shim-promise
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/shim-promise');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('shim-promise', rule, {
    valid: [
        'var Promise = function () {};',
        'function Promise() {}',
        'class Promise {}',
        '(function () {Promise = function () {};})()',
        'Promise = (function () {var Promise = function () {};return Promise;})()',
        'Promise = (function () {function foo() {};return foo;})()',
        '(function () {var Promise1 = function () {};})()',
        '(function (global) {var Promise = function () {};global.Promise = Promise;})(window)',
        {
            code: ''
                + '(function (factory) {\n'
                + '    window.Promise = factory();\n'
                + '})(function () {\n'
                + '    var Promise = function () {};\n'
                + '    return Promise;\n'
                + '});'
        },
        {
            code: '(function (win) {var Promise = function () {};win.Promise = Promise;})(window)',
            options: ['win']
        }
    ],
    invalid: [
        {
            code: '(function () {var Promise;Promise = function () {};})()',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Promise should be shimmed to global scope.'
                }
            ]
        },
        {
            code: '(function () {var Promise = function () {};})()',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Promise should be shimmed to global scope.'
                }
            ]
        },
        {
            code: '(function (global) {var Promise = function () {};global.Promise = null;})(window)',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Promise should be shimmed to global scope.'
                }
            ]
        },
        {
            code: '(function (global) {var Promise = function () {};Promise = null;})(window)',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Promise should be shimmed to global scope.'
                }
            ]
        }
    ]
});
