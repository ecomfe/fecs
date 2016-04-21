/**
 * @file Check AMD module id.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/valid-amd-id');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('valid-amd-id', rule, {

    valid: [
        'requirejs.define(function (require) {})',
        'define(function (require) {})',
        'define({})',
        'define([])',
        'define(["require"], function (require) {})',
        'define("foo", {})',
        'define("foo", function (require) {})',
        'define("foo/bar", function (require) {})',
        'define("foo-bar", function (require) {})',
        'define("foo-bar/baz", function (require) {})',
        'define("foo-bar/bla-bla/99b", function (require) {})',
        'define("0", function (require) {})',
        'define("0/1", function (require) {})'
    ],

    invalid: [
        {
            code: 'define("$foo", {})',
            errors: [{
                message: 'Unexpected id of AMD module.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'define("/foo", {})',
            errors: [{
                message: 'Unexpected id of AMD module.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'define("@foo", {})',
            errors: [{
                message: 'Unexpected id of AMD module.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'define("#foo", {})',
            errors: [{
                message: 'Unexpected id of AMD module.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'define("foo/bar%", {})',
            errors: [{
                message: 'Unexpected id of AMD module.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'define("(foo)/[bar]", {})',
            errors: [{
                message: 'Unexpected id of AMD module.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'var foo = true;define(foo, function (require) {})',
            errors: [{
                message: 'Unexpected id of AMD module.',
                type: 'CallExpression'
            }]
        }
    ]
});
