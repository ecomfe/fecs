/**
 * @file test for use-async-require.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/use-async-require');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('use-async-require', rule, {

    valid: [
        'var require = function () {};\nrequire("foo");',
        'Require("foo");',
        'foo.require("foo");',
        'function foo(require) {\nrequire("foo");\n}',
        'require(["foo"], callback);',
        'var deps = ["foo", "bar"];require(deps, callback)'
    ],

    invalid: [
        {
            code: 'require(foo, callback)',
            errors: [{
                message: 'Global require should be called as async.',
                type: 'Identifier'
            }]
        },
        {
            code: 'require(["foo"]);',
            errors: [{
                message: 'Global require should be called as async.',
                type: 'ArrayExpression'
            }]
        },
        {
            code: 'require("foo");',
            errors: [
                {
                    message: 'Global require should be called as async.',
                    type: 'Literal'
                }
            ]
        },
        {
            code: 'var foo = "foo";require(foo, callback);',
            errors: [
                {
                    message: 'Global require should be called as async.',
                    type: 'Identifier'
                }
            ]
        }
    ]
});
