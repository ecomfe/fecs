/**
 * @file 检查 ES6 模块中是否使用 require
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/no-require');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ERROR = {
    /* eslint-disable fecs-valid-var-jsdoc */
    message: 'Disallow to use `require` in ES6 file.',
    type: 'CallExpression'
    /* eslint-enable fecs-valid-var-jsdoc */
};

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('no-require', rule, {

    valid: [
        /* eslint-disable fecs-indent */
        [
            '',
            'import path from "path";',
            'if (1 > 0) {',
            '   var require = function () {};',
            '   require();',
            '}',
            'require();'
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'if (1 > 0) {',
            '   require();',
            '   var require = function () {};',
            '}',
            'require();'
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'try {',
            '   var a = b;',
            '}',
            'catch (e) {',
            '   var require = function () {};',
            '   require();',
            '}',
            'require();',
            ''
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'try {',
            '   var a = b;',
            '}',
            'catch (e) {',
            '   require();',
            '   var require = function () {};',
            '}',
            'require();',
            ''
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'try {',
            '   var require = function () {};',
            '   require();',
            '}',
            'catch (e) {}',
            'require();',
            ''
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'try {',
            '   require();',
            '   var require = function () {};',
            '}',
            'catch (e) {}',
            'require();',
            ''
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'var i = 0;',
            'while (i < 6) {',
            '   i++;',
            '   var require = function () {};',
            '   require();',
            '}',
            'require();',
            ''
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'var i = 0;',
            'while (i < 6) {',
            '   i++;',
            '   require();',
            '   var require = function () {};',
            '}',
            'require();',
            ''
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'for (var value of []) {',
            '   var require = function () {};',
            '   require();',
            '}',
            'require();',
            ''
        ].join('\n'),
        [
            '',
            'import path from "path";',
            'for (var value of []) {',
            '   require();',
            '   var require = function () {};',
            '}',
            'require();',
            ''
        ].join('\n'),
        [
            'import path from "path";',
            'function require() {}',
            'function aa() {',
            '   function require1() {}',
            '   function cc() {',
            '       function require2() {}',
            '       function require3() {',
            '           function require() {}',
            '           require();',
            '       }',
            '   }',
            '   require();',
            '}'
        ].join('\n'),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
            '   function require() {}',
            '   function cc() {',
            '       function require2() {}',
            '       function require3() {',
            '           function require4() {}',
            '           require();',
            '       }',
            '   }',
            '   require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
            '   function require2() {}',
            '   function cc() {',
            '       function require() {}',
            '       require();',
            '       function require3() {',
            '           function require4() {}',
            '           require();',
            '       }',
            '   }',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
            '   function require2() {}',
            '   function cc() {',
            '       const require = function () {};',
            '       require();',
            '       function require3() {',
            '           function require4() {}',
            '           require();',
            '       }',
            '   }',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
            '   function require2() {}',
            '   function cc() {',
            '       let require = function () {};',
            '       require();',
            '       function require3() {',
            '           function require4() {}',
            '           require();',
            '       }',
            '   }',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
            '   function require2() {}',
            '   function cc() {',
            '       var require = function () {};',
            '       require();',
            '       function require3() {',
            '           function require4() {}',
            '           require();',
            '       }',
            '   }',
            '}'
        ].join(''),
        /* eslint-enable fecs-indent */
        'const require = () => {}',
        'const notRequire = () => {}',
        'var require = function () {}',
        'var notRequire = function () {}',
        'function require() {}',
        'function notRequire() {}',
        'var q = {require: function () {}}',
        'var q = {notRequire: function () {}}',
        'notRequire()',
        'var a = {b: function () {}}; var require = a.b; require()',
        'var foo = {};var require = foo.bar;require();'
    ],

    invalid: [
        /* eslint-disable fecs-indent */
        {
            code: [
                '',
                'import path from "path";',
                'if (1 > 0) {',
                '   const require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'if (1 > 0) {',
                '   require();',
                '   const require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'if (1 > 0) {',
                '   let require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'if (1 > 0) {',
                '   require();',
                '   let require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'if (1 > 0) {',
                '   function require() {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'if (1 > 0) {',
                '   require();',
                '   function require() {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   var a = b;',
                '}',
                'catch (e) {',
                '   function require() {}',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   var a = b;',
                '}',
                'catch (e) {',
                '   require();',
                '   function require() {}',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   var a = b;',
                '}',
                'catch (e) {',
                '   const require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   var a = b;',
                '}',
                'catch (e) {',
                '   require();',
                '   const require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   var a = b;',
                '}',
                'catch (e) {',
                '   let require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   var a = b;',
                '}',
                'catch (e) {',
                '   require();',
                '   let require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },

        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   function require() {}',
                '   require();',
                '}',
                'catch (e) {}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   require();',
                '   function require() {}',
                '}',
                'catch (e) {}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   const require = function () {};',
                '   require();',
                '}',
                'catch (e) {}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   require();',
                '   const require = function () {};',
                '}',
                'catch (e) {}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   let require = function () {};',
                '   require();',
                '}',
                'catch (e) {}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'try {',
                '   require();',
                '   let require = function () {};',
                '}',
                'catch (e) {}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'var i = 0;',
                'while (i < 6) {',
                '   i++;',
                '   function require() {}',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'var i = 0;',
                'while (i < 6) {',
                '   i++;',
                '   require();',
                '   function require() {}',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'var i = 0;',
                'while (i < 6) {',
                '   i++;',
                '   const require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'var i = 0;',
                'while (i < 6) {',
                '   i++;',
                '   require();',
                '   const require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'var i = 0;',
                'while (i < 6) {',
                '   i++;',
                '   let require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'var i = 0;',
                'while (i < 6) {',
                '   i++;',
                '   require();',
                '   let require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'for (var value of []) {',
                '   function require() {}',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'for (var value of []) {',
                '   require();',
                '   function require() {}',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'for (var value of []) {',
                '   const require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'for (var value of []) {',
                '   require();',
                '   const require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'for (var value of []) {',
                '   let require = function () {};',
                '   require();',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                '',
                'import path from "path";',
                'for (var value of []) {',
                '   require();',
                '   let require = function () {};',
                '}',
                'require();',
                ''
            ].join('\n'),
            errors: [ERROR]
        },
        {
            code: [
                'import path from "path";',
                'function require1() {}',
                'require();',
                'function aa() {',
                    'function require2() {}',
                    'require();',
                    'function cc() {',
                        'function require3() {}',
                        'require();',
                        'function require4() {',
                            'function require5() {}',
                            'require();',
                        '}',
                    '}',
                    'require();',
                '}'
            ].join(''),
            errors: [ERROR, ERROR, ERROR, ERROR, ERROR]
        },
        /* eslint-enable fecs-indent */
        {
            code: 'require("http")',
            errors: [ERROR]
        },
        {
            code: 'require("path")',
            errors: [ERROR]
        }
    ]
});
