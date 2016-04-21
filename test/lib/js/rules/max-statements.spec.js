/**
 * @file Check statements of function.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/max-statements');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('max-statements', rule, {

    valid: [
        {
            code: 'var foo = { thing: function() { var bar = 1; var baz = 2; } }',
            options: [2]
        },
        {
            code: 'var foo = { thing: () => { var bar = 1; var baz = 2; } }',
            options: [2]
        },
        {
            code: 'function foo() {var bar = 1; function qux () { var noCount = 2; } return 3; }',
            options: [3]
        },
        {
            code: 'function foo() {var bar = 1; if (true) {for (;;) {var qux = null;}} else {quxx();} return 3;}',
            options: [6]
        },
        {
            code: 'function foo() { var x = 5; function bar() { var y = 6; } bar(); z = 10; baz(); }',
            options: [5]
        },
        {
            code: 'function foo() { var a; var b; var c; var x; var y; var z; bar(); baz(); qux(); quxx(); }'
        },
        {
            code: '(function() { var bar = 1; return function () { return 42; }; })()',
            options: [1, {IIFE: true}]
        },
        {
            code: 'define(["foo", "qux"], function(foo, qux) { var bar = 1; var baz = 2; })',
            options: [1, {AMD: true}]
        }
    ],
    invalid: [
        {
            code: 'function foo() { var bar = 1; var baz = 2; var qux = 3; }',
            options: [2],
            errors: [{message: 'This function has too many statements (3). Maximum allowed is 2.'}]
        },
        {
            code: 'var foo = () => { var bar = 1; var baz = 2; var qux = 3; };',
            options: [2],
            errors: [{message: 'This function has too many statements (3). Maximum allowed is 2.'}]
        },
        {
            code: 'var foo = function() { var bar = 1; var baz = 2; var qux = 3; };',
            options: [2],
            errors: [{message: 'This function has too many statements (3). Maximum allowed is 2.'}]
        },
        {
            code: 'function foo() {var bar = 1; if (true) { while (false) { var qux = null; } } return 3; }',
            options: [4],
            errors: [{message: 'This function has too many statements (5). Maximum allowed is 4.'}]
        },
        {
            code: 'function foo() {var bar = 1; if (true) { for (;;) { var qux = null; } } return 3; }',
            options: [4],
            errors: [{message: 'This function has too many statements (5). Maximum allowed is 4.'}]
        },
        {
            code: 'function foo() {var bar = 1; if (true) {for (;;) {var qux = null;}} else {quxx();} return 3;}',
            options: [5],
            errors: [{message: 'This function has too many statements (6). Maximum allowed is 5.'}]
        },
        {
            code: 'function foo() { var x = 5; function bar() { var y = 6; } bar(); z = 10; baz(); }',
            options: [3],
            errors: [{message: 'This function has too many statements (5). Maximum allowed is 3.'}]
        },
        {
            code: 'function foo() { var x = 5; function bar() { var y = 6; } bar(); z = 10; baz(); }',
            options: [4],
            errors: [{message: 'This function has too many statements (5). Maximum allowed is 4.'}]
        },
        {
            code: ';(function() { var bar = 1; return function () { var z; return 42; }; })()',
            options: [1, {IIFE: true}],
            errors: [{message: 'This function has too many statements (2). Maximum allowed is 1.'}]
        },
        {
            code: ';(function() { var bar = 1; var baz = 2; })(); (function() { var bar = 1; var baz = 2; })()',
            options: [1],
            errors: [
                {message: 'This function has too many statements (2). Maximum allowed is 1.'},
                {message: 'This function has too many statements (2). Maximum allowed is 1.'}
            ]
        },
        {
            code: [
                'define(["foo", "qux"], function(foo, qux) {',
                '    var bar = 1;',
                '    var baz = 2;',
                '    return function () {',
                '        var z;',
                '        return 42;',
                '    };',
                '})'
            ].join('\n'),
            options: [1, {AMD: true}],
            errors: [{message: 'This function has too many statements (2). Maximum allowed is 1.'}]
        },
        {
            code: 'function foo() {var a;var b;var c;var x;var y;var z;bar();baz();qux();quxx();foo();}',
            errors: [{message: 'This function has too many statements (11). Maximum allowed is 10.'}]
        }
    ]
});
