/**
 * @file Check method definition.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/use-property-shorthand');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('use-property-shorthand', rule, {

    valid: [
        'let foo = true,bar = {foo}',
        'let foo = true,bar = false,baz = {foo, bar}',
        {
            code: 'let foo = true,bar = {foo, baz() {}}',
            options: [{method: true}]
        },
        {
            code: 'let foo = true,bar = {foo: foo, baz() {}}',
            options: [{method: false}]
        },
        {
            code: 'let foo = true,bar = {foo, ["baz"]() {}}',
            options: [{computed: true}]
        },
        {
            code: 'let foo = true,bar = {foo: foo, ["baz"]() {}}',
            options: [{computed: false}]
        },
        {
            code: 'let foo = true,bar = {foo, ...args}',
            options: [{spread: true}]
        },
        {
            code: 'let foo = true,bar = {foo: foo, ...args}',
            options: [{spread: false}]
        },
        {
            code: 'let foo = true,bar = {foo, get baz() {}}',
            options: [{get: true}]
        },
        {
            code: 'let foo = true,bar = {foo, get baz() {}}',
            options: [{get: false}]
        },
        {
            code: 'let foo = true,bar = {foo, set baz(v) {}}',
            options: [{set: true}]
        },
        {
            code: 'let foo = true,bar = {foo, set baz(v) {}}',
            options: [{set: false}]
        }
    ],

    invalid: [
        {
            code: 'let foo = true,bar = {foo: foo}',
            errors: [{
                message: 'Expected shorthand for `foo`.',
                type: 'Property'
            }]
        },
        {
            code: 'let foo = true,bar = {foo: foo, baz() {}}',
            options: [{method: true}],
            errors: [{
                message: 'Expected shorthand for `foo`.',
                type: 'Property'
            }]
        },
        {
            code: 'let foo = true,bar = {foo: foo, ["baz"]() {}}',
            options: [{computed: true}],
            errors: [{
                message: 'Expected shorthand for `foo`.',
                type: 'Property'
            }]
        },
        {
            code: 'let foo = true,bar = {foo: foo, ...args}',
            options: [{spread: true}],
            errors: [{
                message: 'Expected shorthand for `foo`.',
                type: 'Property'
            }]
        },
        {
            code: 'let foo = true,bar = {foo: foo, get baz() {}}',
            options: [{get: true}],
            errors: [{
                message: 'Expected shorthand for `foo`.',
                type: 'Property'
            }]
        },
        {
            code: 'let foo = true,bar = {foo: foo, set baz(v) {}}',
            options: [{set: true}],
            errors: [{
                message: 'Expected shorthand for `foo`.',
                type: 'Property'
            }]
        }
    ]
});
