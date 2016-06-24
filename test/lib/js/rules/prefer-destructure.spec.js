/**
 * @file Tests for prefer-destructure
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-destructure');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-destructure', rule, {
    valid: [
        'let foo = 1, bar = 2;',
        'function foobar() {let foo = 1, bar = 2;}',
        'let foobar = function () {let foo = 1, bar = 2;}',
        'foo((x, y) => x = y + 1);',
        'let temp = x;y = temp;x = 1;',
        'let temp = x;y = temp;x = temp;',
        'let foo = {bar: 1, baz: 2};export let bar = foo.bar;export let baz = foo.baz;'
    ],
    invalid: [
        {
            code: 'function foo(x, y) {\n'
                + '    let temp = x;\n'
                + '    x = y;\n'
                + '    y = temp;\n'
                + '}',
            errors: [
                {
                    line: 2,
                    type: 'Identifier',
                    message: 'Expected to reduce `temp` by destructuring `[x, y]`.'
                }
            ]
        },
        {
            code: ''
                + 'let foo = foobar.foo;\n'
                + 'let bar = foobar.bar;',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to reduce `foo, bar` by destructuring `foobar`.'
                }
            ]
        },
        {
            code: ''
                + 'let temp = x;\n'
                + 'x = y;\n'
                + 'y = temp',
            errors: [
                {
                    line: 1,
                    type: 'Identifier',
                    message: 'Expected to reduce `temp` by destructuring `[x, y]`.'
                }
            ]
        }
    ]
});
