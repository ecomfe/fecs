/**
 * @file Check properties quote.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/properties-quote');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('properties-quote', rule, {

    valid: [
        '({0: 0})',
        '({null: 0})',
        '({true: 0})',
        '({\'a-b\': 0})',
        '({\'if\': 0})',
        '({\'@\': 0})',
        '({[x]: 0});',
        '({x});',
        '({a: 0, b(){}})',
        '({a: 0, [x]: 1})',
        '({a: 0, x})',
        '({ \'@\': 0, [x]: 1 })',
        '({\'@\': 0, x})',
        '({a: 0, b: 0})',
        '({a: 0, 0: 0})',
        '({a: 0, true: 0})',
        '({a: 0, null: 0})',
        '({\'a\': 0, \'@\': 0})',
        '({a: 0, 0: 0})',
        '({\'a\': 0, \'0x0\': 0})',
        '({\' 0\': 0, \'0x0\': 0})',
        '({\'hey//meh\': 0})',
        '({\'hey/*meh\': 0})',
        '({\'hey/*meh*/\': 0})',
        '({\'a\': 0, \'-b\': 0})',
        '({x, ...y})',
        {
            code: '({a: 0, volatile: 0})',
            options: [{ignore: 'volatile'}]
        },
        {
            code: '({a: 0, if: 0})',
            options: [{ignore: 'if'}]
        },
        {
            code: '({a: 0, while: 0})',
            options: [{ignore: 'while'}]
        },
        {
            code: '({if: 0, while: 0})',
            options: [{ignore: ['if', 'while']}]
        }
    ],
    invalid: [
        {
            code: '({"0": 0})',
            errors: [{message: 'Expected key `0` but `\'0\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({"null": 0})',
            errors: [{message: 'Expected key `null` but `\'null\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({"true": 0})',
            errors: [{message: 'Expected key `true` but `\'true\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({if: 0})',
            errors: [{message: 'Expected key `\'if\'` but `if` found.baidu095', type: 'Property'}]
        },
        {
            code: '({if: 0, b(){}})',
            errors: [{message: 'Expected key `\'if\'` but `if` found.baidu095', type: 'Property'}]
        },
        {
            code: '({"a": 0, [x]: 1})',
            errors: [{message: 'Expected key `a` but `\'a\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({"a": 0, x})',
            errors: [{message: 'Expected key `a` but `\'a\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({a: 0, \'@\': 0, [x]: 1 })',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({"a": 0, b: 0})',
            errors: [{message: 'Expected key `a` but `\'a\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({a: 0, \'07\': 0})',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({a: 0, 0x1: 0})',
            errors: [
                {message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'},
                {message: 'Expected key `\'0x1\'` but `0x1` found.baidu095', type: 'Property'}
            ]
        },
        {
            code: '({a: 0, "00": 0})',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({a: 0, "true": 0})',
            errors: [{message: 'Expected key `true` but `\'true\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({a: 0, "null": 0})',
            errors: [{message: 'Expected key `null` but `\'null\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({a: 0, \'@\': 0})',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({\'a\': 0, 0x0: 0})',
            errors: [{message: 'Expected key `\'0x0\'` but `0x0` found.baidu095', type: 'Property'}]
        },
        {
            code: '({\' 0\': 0, 0x0: 0})',
            errors: [{message: 'Expected key `\'0x0\'` but `0x0` found.baidu095', type: 'Property'}]
        },
        {
            code: '({\'hey//meh\': 0, a: 0})',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({\'hey/*meh\': 0, a: 0})',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({\'hey/*meh*/\': 0, a: 0})',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({a: 0, \'-b\': 0})',
            errors: [{message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'}]
        },
        {
            code: '({x, ...y, \'z\': 0})',
            errors: [{message: 'Expected key `z` but `\'z\'` found.baidu094', type: 'Property'}]
        },
        {
            code: '({a: 0, volatile: 0})',
            errors: [
                {message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'},
                {message: 'Expected key `\'volatile\'` but `volatile` found.baidu095', type: 'Property'}
            ]
        },
        {
            code: '({a: 0, if: 0})',
            errors: [
                {message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'},
                {message: 'Expected key `\'if\'` but `if` found.baidu095', type: 'Property'}
            ]
        },
        {
            code: '({a: 0, while: 0})',
            errors: [
                {message: 'Expected key `\'a\'` but `a` found.baidu095', type: 'Property'},
                {message: 'Expected key `\'while\'` but `while` found.baidu095', type: 'Property'}
            ]
        },
        {
            code: '({if: 0, while: 0})',
            errors: [
                {message: 'Expected key `\'if\'` but `if` found.baidu095', type: 'Property'},
                {message: 'Expected key `\'while\'` but `while` found.baidu095', type: 'Property'}
            ]
        },
        {
            code: '({\'a\': 0, if: 0, while: 0})',
            options: [{ignore: ['if', 'while']}],
            errors: [
                {message: 'Expected key `a` but `\'a\'` found.baidu094', type: 'Property'}
            ]
        },
        {
            code: '({\'a\': 0, while: 0})',
            options: [{ignore: 'while'}],
            errors: [
                {message: 'Expected key `a` but `\'a\'` found.baidu094', type: 'Property'}
            ]
        }
    ]
});
