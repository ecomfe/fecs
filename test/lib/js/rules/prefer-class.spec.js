/**
 * @file Check class definitions.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-class');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-class', rule, {

    valid: [
        'function foo() {}',
        'var foo = function () {}',
        'var foo = function () {return "bar";}',
        '(function () {})()',
        'class Foo {}',
        'class Foo extends Bar {}',
        'export class Foo{}',
        'export default class {}',
        'export default class Foo extends Bar {}',
        'export default function () {}',
        'export default function Foo(props, context) {}',
        'let Foo = function (props, context) {}',
        'let Foo = function ({foo, bar}, context) {return <div />;}',
        'let Foo = function ({foo, bar}, context) {return foo ? null : <Bar />;}',
        'let Foo = function ({foo, bar}) {return foo ? <Foo /> : <div />;}',
        'let Foo = function ({foo, bar}) {return foo && <Foo />;}',
        'let Foo = function ({foo, bar}) {let jsx = foo ? <Foo /> : <div />;return jsx;}',
        'let Foo = ({foo, bar}) => (<div />)',
        'let Foo = ({foo, bar}, context) => <div />',
        'let Foo = ({foo, bar}, {baz}) => <div />',
        'let Foo = (prop, ctx) => (<div />)',
        'let Foo = ({onClick}) => (<div onClick={() => onClick()} />)'
    ],

    invalid: [
        {
            code: 'let Foo = function ({foo, bar}, context) {return;}',
            errors: [{
                message: 'Expected `class Foo` but found `FunctionExpression`.',
                type: 'FunctionExpression'
            }]
        },
        {
            code: 'function Foo({foo, bar}) {return null;}',
            errors: [{
                message: 'Expected `class Foo` but found `FunctionDeclaration`.',
                type: 'FunctionDeclaration'
            }]
        },
        {
            code: 'let Foo = function ({foo, bar}, context) {return jsx;}',
            errors: [{
                message: 'Expected `class Foo` but found `FunctionExpression`.',
                type: 'FunctionExpression'
            }]
        },
        {
            code: 'var Foo = function () {}',
            errors: [{
                message: 'Expected `class Foo` but found `FunctionExpression`.',
                type: 'FunctionExpression'
            }]
        },
        {
            code: 'function Foo() {}',
            errors: [{
                message: 'Expected `class Foo` but found `FunctionDeclaration`.',
                type: 'FunctionDeclaration'
            }]
        }
    ]
});
