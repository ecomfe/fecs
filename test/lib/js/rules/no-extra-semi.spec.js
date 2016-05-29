/**
 * @file Check `Super` callings.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-extra-semi');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-extra-semi', rule, {
    valid: [
        'var x = 5;',
        'function foo(){}',
        'for(;;);',
        'while(0);',
        'do;while(0);',
        'for(a in b);',
        'for(a of b);',

        // Class body.
        'class A { }',
        'var A = class { };',
        'class A { a() { this; } }',
        'var A = class { a() { this; } };',
        'class A {a: true;}',
        'class A { } a;',

        // modules
        'export const x = 42;',
        'export default 42;',

        // IIFE
        ';(function () {})();',
        ';(function () {}());',

        // Decorator
        'class A {@deco()\na() {}}',
        'class A {@deco()\nget a() {}}',
        'class A {@deco();["a"]() {}}'
    ],
    invalid: [
        {
            code: ';var x = 5;',
            errors: [{message: 'Unnecessary semicolon.', type: 'EmptyStatement'}]
        },
        {
            code: 'var x = 5;;',
            errors: [{message: 'Unnecessary semicolon.', type: 'Program'}]
        },
        {
            code: 'function foo(){};',
            errors: [{message: 'Unnecessary semicolon.', type: 'FunctionDeclaration'}]
        },
        {
            code: 'export default function foo(){};',
            errors: [
                {message: 'Unnecessary semicolon.', type: 'ExportDefaultDeclaration'}
            ]
        },
        {
            code: 'export function foo(){};',
            errors: [
                {message: 'Unnecessary semicolon.', type: 'ExportNamedDeclaration'}
            ]
        },
        {
            code: 'for(;;);;',
            errors: [{message: 'Unnecessary semicolon.', type: 'ForStatement'}]
        },
        {
            code: 'while(0);;',
            errors: [{message: 'Unnecessary semicolon.', type: 'WhileStatement'}]
        },
        {
            code: 'do;while(0);;',
            errors: [{message: 'Unnecessary semicolon.', type: 'Program'}]
        },
        {
            code: 'for(a in b);;',
            errors: [{message: 'Unnecessary semicolon.', type: 'ForInStatement'}]
        },
        {
            code: 'for(a of b);;',

            errors: [{message: 'Unnecessary semicolon.', type: 'ForOfStatement'}]
        },

        // Class body.
        {
            code: 'class A { ; }',
            errors: [{message: 'Unnecessary semicolon.', type: 'ClassBody', column: 11}]
        },
        {
            code: 'class A { /*a*/; }',
            errors: [{message: 'Unnecessary semicolon.', type: 'ClassBody', column: 16}]
        },
        {
            code: 'class A { ; a() {} }',
            errors: [{message: 'Unnecessary semicolon.', type: 'ClassBody', column: 11}]
        },
        {
            code: 'class A { a() {}; }',
            errors: [{message: 'Unnecessary semicolon.', type: 'MethodDefinition', column: 17}]
        },
        {
            code: 'class A { a() {}; b() {} }',
            errors: [{message: 'Unnecessary semicolon.', type: 'MethodDefinition', column: 17}]
        },
        {
            code: 'class A {; a() {}; b() {}; }',
            errors: [
                {message: 'Unnecessary semicolon.', type: 'ClassBody', column: 10},
                {message: 'Unnecessary semicolon.', type: 'MethodDefinition', column: 18},
                {message: 'Unnecessary semicolon.', type: 'MethodDefinition', column: 26}
            ]
        },
        {
            code: 'class A {\n@deco();\na() {}}',
            errors: [{message: 'Unnecessary semicolon.', type: 'Decorator', line: 2, column: 8}]
        },
        {
            code: 'class A { a() {}; get b() {} }',
            errors: [{message: 'Unnecessary semicolon.', type: 'MethodDefinition', column: 17}]
        }
    ]
});
