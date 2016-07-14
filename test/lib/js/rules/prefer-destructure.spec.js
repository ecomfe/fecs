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
        'let {a, b} = c.d',
        'let foo = {bar: 1, baz: 2};export let bar = foo.bar;export let baz = foo.baz;',
        {
            code: [
                'function getXY(element) {',
                '    let x = 0;',
                '    let y = 0;',
                '    while (element.offsetParent) {',
                '        y += element.offsetTop;',
                '        x += element.offsetLeft;',
                '        element = element.offsetParent;',
                '    }',
                '    return {x, y};',
                '}'
            ].join('\n')
        },
        {
            code: [
                'function remove(node, keepChildren) {',
                '    let parent = node.parentNode;',
                '    let child;',
                '    if (parent) {',
                '        if (keepChildren && node.hasChildNodes()) {',
                '            while (child = node.firstChild) {',
                '                parent.insertBefore(child, node);',
                '            }',
                '        }',
                '        parent.removeChild(node);',
                '    }',
                '    return node;',
                '}'
            ].join('\n')
        }
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
