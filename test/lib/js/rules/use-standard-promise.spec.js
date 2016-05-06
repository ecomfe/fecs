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
        'let defer = defer();',
        'let defer = new Deferred();',
        'let defer = window.jQuery.Deferred();',
        'let p = Promise.all([p1, p2, p3]);',
        'let p = Promise["all"]([p1, p2, p3]);',
        'let p = Promise.race([p1, p2, p3]);',
        'let p = promise["race"]([p1, p2, p3]);',
        'let p = promise.resolve();',
        'let p = promise.reject();',
        'let p = promise.then(resolve);',
        'let p = promise.catch(reason);',
        {
            code: 'let p = Promise.any([p1, p2, p3]);',
            options: [{any: true}]
        }
    ],
    invalid: [
        {
            code: 'promise.done();',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to use standard Promise APIs.'
                }
            ]
        },
        {
            code: 'promise.finally(callback);',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to use standard Promise APIs.'
                }
            ]
        },
        {
            code: 'let p = Promise.any([p1, p2, p3]);',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to use standard Promise APIs.'
                }
            ]
        },
        {
            code: 'let p = Promise["any"]([p1, p2, p3]);',
            errors: [
                {
                    line: 1,
                    type: 'Literal',
                    message: 'Expected to use standard Promise APIs.'
                }
            ]
        },
        {
            code: 'let defer = Q.defer();',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to use standard Promise APIs.'
                }
            ]
        },
        {
            code: 'let defer = $.Deferred();',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to use standard Promise APIs.'
                }
            ]
        },
        {
            code: 'let defer = new jQuery.Deferred();',
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
