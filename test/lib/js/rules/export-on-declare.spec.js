/**
 * @file Check export declares.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/export-on-declare');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('export-on-declare', rule, {

    valid: [
        'export function foo() {}',
        'let bar = true;export default function foo() {}',
        'export const foo = 1;',
        'export default function () {}',
        'let foo = true;\nif (foo) {}\nexport default foo;',
        'let foo = true;\nif (foo) {}\nexport default [foo, bar];',
        'let foo = true;\nif (foo) {}\nexport {foo};',
        'let foo = true;\nif (foo) {}\nexport {foo, bar};',
        'export default [foo, bar]',
        'export default {foo, bar}',
        'export default class {}',
        'export class Foo {}',
        'export new Foo();',
        'export default (function (foo) {return foo;})();',
        'export {a};',
        'export const foo = {a, bar};',
        'export {};'
    ],

    invalid: [
        {
            code: 'let foo = true;export {foo};',
            errors: [{message: 'Use `export` on declare.', type: 'Identifier'}]
        },
        {
            code: 'let foo = true;export {foo, bar};',
            errors: [{message: 'Use `export` on declare.', type: 'Identifier'}]
        },
        {
            code: 'let foo = true;export default {foo, bar};',
            errors: [{message: 'Use `export` on declare.', type: 'Identifier'}]
        },
        {
            code: 'let foo = true;export default [foo, bar];',
            errors: [{message: 'Use `export` on declare.', type: 'Identifier'}]
        },
        {
            code: 'const foo = true;export default foo;',
            errors: [{message: 'Use `export` on declare.', type: 'Identifier'}]
        }
    ]
});
