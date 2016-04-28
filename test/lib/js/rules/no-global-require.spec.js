/**
 * @file Check global require.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-global-require');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({env: {es6: true}});

ruleTester.run('no-global-require', rule, {

    valid: [
        'var foo = require("foo");',
        'require(["foo"], (foo) => {});',
        'function define(require) {var foo = require("foo");}',
        'function foo() {try {throw new Error("foo");} catch(e) {require("foo")}}',
        'function* foo() {with (Math) {require("foo")}}',
        '() => {var foo = require("foo");}',
        'define(function () {var require = String,foo = require("foo");})',
        'define(function (require) {var foo = require("foo");})',
        'define(function () {require(["foo"], (foo) => {});})',
        'define(function () {window.require(["foo"]);})',
        'var require = eval;require("foo=true");',
        'define(function () {try {throw new Error("foo")} catch (require) {require("foo");}})',
        'define(function (require) {try {throw new Error("foo")} catch (e) {require("foo");}})',
        'define(function () {var esl = {require: eval, define: eval};with(esl) {require("foo");}});',
        'define(function () {var esl;with(esl = {require: eval, define: eval}) {require("foo");}});',
        'define(function () {with({require: eval, define: eval}) {require("foo");}});'
    ],

    invalid: [
        {
            code: 'define(function () {var foo = require("foo");})',
            errors: [{
                message: 'Expected a local require (Missing `require` in AMD factory).',
                type: 'CallExpression'
            }]
        },
        {
            code: 'define(function (req) {var foo = require("foo");})',
            errors: [{
                message: 'Expected a local require (Missing `require` in AMD factory).',
                type: 'CallExpression'
            }]
        },
        {
            code: 'define(function () {with(esl) {require("foo");}});',
            errors: [
                {
                    message: 'Expected a local require (Missing `require` in AMD factory).',
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'define(function () {var esl = {};with(esl) {require("foo");}});',
            errors: [
                {
                    message: 'Expected a local require (Missing `require` in AMD factory).',
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'define(function () {with(getObject()) {require("foo");}});',
            errors: [
                {
                    message: 'Expected a local require (Missing `require` in AMD factory).',
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'define(function () {try {throw new Error("foo");} catch (e) {\nrequire("foo");}})',
            errors: [
                {
                    message: 'Expected a local require (Missing `require` in AMD factory).',
                    line: 2,
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'define(function () {try {\nrequire();} catch (require) {}\nrequire("foo");})',
            errors: [
                {
                    message: 'Expected a local require (Missing `require` in AMD factory).',
                    line: 2,
                    type: 'CallExpression'
                },
                {
                    message: 'Expected a local require (Missing `require` in AMD factory).',
                    line: 3,
                    type: 'CallExpression'
                }
            ]
        }
    ]
});
