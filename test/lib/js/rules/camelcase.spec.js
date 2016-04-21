/**
 * @file Tests for camelcase rule.
 * @author Nicholas C. Zakas
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/camelcase');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

ruleTester.run('camelcase', rule, {
    valid: [
        'firstName = "Chris"',
        'FIRST_NAME = "Chris"',
        '__myPrivateVariable = "Patrick"',
        'myPrivateVariable__ = "Patrick"',
        '__myPrivateVariable__ = "Patrick"',
        'function doSomething(){}',
        'do_something()',
        'foo.do_something()',
        'var foo = bar.baz_boom;',
        'var foo = bar.baz_boom.something;',
        'foo.boom_pow.qux = bar.baz_boom.something;',
        'if (bar.baz_boom) {}',
        'var obj = { key: foo.bar_baz };',
        'var arr = [foo.bar_baz];',
        '[foo.bar_baz]',
        'var arr = [foo.bar_baz.qux];',
        '[foo.bar_baz.nesting]',
        'if (foo.bar_baz === boom.bam_pow) { [foo.baz_boom] }',
        'var o = {key: 1}',
        'var o = {\n/**\n * @private\n*/_key: function () {}}',
        {
            code: 'var o = {\'bar_baz\': 1}',
            options: [{quote: true}]
        },
        {
            code: 'obj.a_b = 2;',
            options: [{ignore: 'a_b'}]
        },
        {
            code: 'obj.a_b = 2;\nobj.b_a = 3;',
            options: [{ignore: ['a_b', 'b_a']}]
        },
        {
            code: 'var obj = {\n a_a: 1 \n};\n obj.a_b = 2;',
            options: [{ignore: '/^a_/'}]
        }
    ],
    invalid: [
        {
            code: 'var o = {_key: function () {}}',
            errors: [
                {
                    message: 'Property \'_key\' is not in camel case.baidu030',
                    type: 'Property'
                }
            ]
        },
        {
            code: 'var first_name = "Chris"',
            errors: [
                {
                    message: 'Identifier \'first_name\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'first_name = "Chris"',
            errors: [
                {
                    message: 'Identifier \'first_name\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: '__private_first_name = "Patrick"',
            errors: [
                {
                    message: 'Identifier \'__private_first_name\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'function foo_bar(){}',
            errors: [
                {
                    message: 'Identifier \'foo_bar\' is not in camel case.baidu027',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'var foo = function (_bar){}',
            errors: [
                {
                    message: 'Identifier \'_bar\' is not in camel case.baidu028',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'obj.foo_bar = function(){};',
            errors: [
                {
                    message: 'Identifier \'foo_bar\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'bar_baz.foo = function(){};',
            errors: [
                {
                    message: 'Identifier \'bar_baz\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: '[foo_bar.baz]',
            errors: [
                {
                    message: 'Identifier \'foo_bar\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'if (foo.bar_baz === boom.bam_pow) { [foo_bar.baz] }',
            errors: [
                {
                    message: 'Identifier \'foo_bar\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'foo.bar_baz = boom.bam_pow',
            errors: [
                {
                    message: 'Identifier \'bar_baz\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'var foo = { bar_baz: boom.bam_pow }',
            errors: [
                {
                    message: 'Property \'bar_baz\' is not in camel case.baidu030',
                    type: 'Property'
                }
            ]
        },
        {
            code: 'foo.qux.boom_pow = { bar: boom.bam_pow }',
            errors: [
                {
                    message: 'Identifier \'boom_pow\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'var o = {bar_baz: 1}',
            errors: [
                {
                    message: 'Property \'bar_baz\' is not in camel case.baidu030',
                    type: 'Property'
                }
            ]
        },
        {
            code: 'obj.a_b = 2;',
            errors: [
                {
                    message: 'Identifier \'a_b\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'obj.a_b = 2;',
            errors: [
                {
                    message: 'Identifier \'a_b\' is not in camel case.baidu025',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'var { category_id: category_id } = query;',
            parserOptions: {ecmaVersion: 6},
            errors: [
                {
                    message: 'Property \'category_id\' is not in camel case.baidu030',
                    type: 'Property'
                }
            ]
        },
        {
            code: 'var { category_id } = query;',
            parserOptions: {ecmaVersion: 6},
            errors: [
                {
                    message: 'Property \'category_id\' is not in camel case.baidu030',
                    type: 'Property'
                }
            ]
        }
    ]
});
