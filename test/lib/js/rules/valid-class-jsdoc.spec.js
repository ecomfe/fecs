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
            code: 'foo = true;',
            options: [{privilege: true}]
        },
        {
            code: 'foo.bar = true;',
            options: [{privilege: true}]
        },
        {
            code: 'foo.bar = function () {};',
            options: [{privilege: true}]
        },
        {
            code: 'class Foo {}',
            options: [{classNode: false}]
        },
        {
            code: 'class Foo extends Fo {}',
            options: [{classNode: false}]
        },
        {
            code: [
                '/**',
                ' * bar',
                ' * @protected',
                ' */',
                'Foo.prototype.bar = function () {}'
            ].join('\n'),
            options: [{privilege: true}]
        },
        {
            code: [
                'Foo.prototype = {',
                '    /**',
                '     * bar',
                '     * @protected',
                '     */',
                '    bar: function () {},',
                '    /**',
                '     * baz',
                '     * @private',
                '     */',
                '    baz: {}',
                '};'
            ].join('\n'),
            options: [{privilege: true}]
        },
        {
            code: [
                'Foo.prototype = bar;'
            ].join('\n'),
            options: [{privilege: true}]
        },
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
            ].join('\n'),
            options: [{classNode: true}]
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
                ' * @extends Fo',
                ' */',
                'class Foo extends Fo {',
                '   /**',
                '    * bar',
                '    * @override',
                '    */',
                '   bar() {',
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
                '    /**',
                '     * @lends Foo.prototype',
                '     */',
                '    {',
                '        /**',
                '         * bar',
                '         * @public',
                '         */',
                '        bar: function () {}',
                '    }',
                ')'
            ].join('\n'),
            options: [{privilege: true}]
        }
    ],

    invalid: [
        {
            code: '/**\n * Foo\n * @class\n * @param {number\n */\nclass Foo {}',
            options: [{classNode: true}],
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
            options: [{classNode: true}],
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
            options: [{classNode: true}],
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
                '   /**',
                '    * bar',
                '    * @override',
                '    */',
                '   bar() {',
                '   }',
                '}'
            ].join('\n'),
            options: [{privilege: true}],
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
                'class Foo extends Fo {',
                '   /**',
                '    * bar',
                '    */',
                '   bar() {',
                '   }',
                '}'
            ].join('\n'),
            options: [{privilege: true}],
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
                'class Foo {',
                '   bar() {',
                '   }',
                '}'
            ].join('\n'),
            options: [{privilege: true}],
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
                '    {',
                '        /**',
                '         * bar',
                '         */',
                '        bar: true',
                '    }',
                ')'
            ].join('\n'),
            options: [{privilege: true}],
            errors: [
                {
                    message: 'Expected to use `@lends` to tag this.baidu050',
                    type: 'ObjectExpression'
                },
                {
                    message: ''
                        + 'Expected to use '
                        + '`@public`, `@protected` or `@private` '
                        + 'to tag the property or method.baidu051',
                    type: 'Property'
                }
            ]
        }
    ]
});
