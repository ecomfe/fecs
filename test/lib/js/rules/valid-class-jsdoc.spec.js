/**
 * @file Tests for valid-class-jsdoc.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/valid-class-jsdoc');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('valid-class-jsdoc', rule, {

    valid: [
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'class Foo {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'function Foo() {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'export function Foo() {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'var Foo = function () {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'export var Foo = function () {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @constructor',
                ' */',
                'var Foo = function () {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'class Foo extends null {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Fooo',
                ' * @class',
                ' * @extends Foo',
                ' */',
                'class Foo extends Foo {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Fooo',
                ' * @class',
                ' * @extends Foo',
                ' */',
                'export default class Foo extends Foo {}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'class Foo {',
                '   /**',
                '    * bar',
                '    * @public',
                '    */',
                '   bar() {',
                '   }',
                '   /**',
                '    * baz',
                '    * @protected',
                '    */',
                '   baz() {',
                '   }',
                '   /**',
                '    * private bar',
                '    * @private',
                '    */',
                '   _bar() {',
                '   }',
                '}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'class Foo {',
                '   /**',
                '    * bar',
                '    * @static',
                '    */',
                '   static bar() {',
                '   }',
                '   static baz() {',
                '   }',
                '}'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'function Foo() {}',
                'util.doSomething(',
                '    Foo.prototype,',
                '    true,',
                '    1',
                ')'
            ].join('\n')
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'function Foo() {}',
                'util.extend(',
                '    Foo.prototype,',
                '    /** @lends Foo.prototype */',
                '    {}',
                ')'
            ].join('\n')
        },
        {
            code: [
                'Foo.prototype = {};'
            ].join('\n')
        }
    ],

    invalid: [
        {
            code: '/**\n * Foo\n * @class\n * @param {number\n */\nclass Foo {}',
            errors: [{
                message: 'Expected to user `@class` to tag a class.baidu048',
                type: 'ClassDeclaration'
            }]
        },
        {
            code: '/**\n * Foo\n * @class\n * @param {number\n */\nfunction Foo() {}',
            errors: [{
                message: 'Expected to user `@class` to tag a class.baidu048',
                type: 'FunctionDeclaration'
            }]
        },
        {
            code: '/**\n * Foo\n * @class\n * @param {number\n */\nvar Foo = function () {}',
            errors: [{
                message: 'Expected to user `@class` to tag a class.baidu048',
                type: 'VariableDeclaration'
            }]
        },
        {
            code: 'class Foo {}',
            errors: [{
                message: 'Expected to user `@class` to tag a class.baidu048',
                type: 'ClassDeclaration'
            }]
        },
        {
            code: 'function Foo() {}',
            errors: [{
                message: 'Expected to user `@class` to tag a class.baidu048',
                type: 'FunctionDeclaration'
            }]
        },
        {
            code: 'var Foo = function () {}',
            errors: [{
                message: 'Expected to user `@class` to tag a class.baidu048',
                type: 'VariableDeclaration'
            }]
        },
        {
            code: 'class Fooo extends Foo {}',
            errors: [
                {
                    message: 'Expected to user `@class` to tag a class.baidu048',
                    type: 'ClassDeclaration'
                },
                {
                    message: 'Expected to use `@extends` to tag a class extends.baidu049',
                    type: 'ClassDeclaration'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'class Foo {',
                '   bar() {',
                '   }',
                '}'
            ].join('\n'),
            errors: [
                {
                    message: ''
                        + 'Expected to use '
                        + '`@public`, `@protected` or `@private` '
                        + 'to tag the property or method.baidu051',
                    type: 'MethodDefinition'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * Foo',
                ' * @class',
                ' */',
                'function Foo() {}',
                'util.extend(',
                '    Foo.prototype,',
                '    {}',
                ')'
            ].join('\n'),
            errors: [
                {
                    message: 'Expected to use `@lends` to tag this.baidu050',
                    type: 'ObjectExpression'
                }
            ]
        }
    ]
});
