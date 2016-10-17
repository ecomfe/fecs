/**
 * @file Check Not allowed require in ES6 file.
 * @author ielgnaw(wuji0223@gmail.com)
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-import-to-require');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-import-to-require', rule, {

    valid: [
        /* eslint-disable fecs-indent */
        [
            'import path from "path";',
            'function require() {}',
            'function aa() {',
                'function require1() {}',
                'function cc() {',
                    'function require2() {}',
                    'function require3() {',
                        'function require() {}',
                        'require();',
                    '}',
                '}',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
                'function require() {}',
                'function cc() {',
                    'function require2() {}',
                    'function require3() {',
                        'function require4() {}',
                        'require();',
                    '}',
                '}',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
                'function require2() {}',
                'function cc() {',
                    'function require() {}',
                    'require();',
                    'function require3() {',
                        'function require4() {}',
                        'require();',
                    '}',
                '}',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require1() {}',
            'function aa() {',
                'function require2() {}',
                'function cc() {',
                    'var require = function () {};',
                    'require();',
                    'function require3() {',
                        'function require4() {}',
                        'require();',
                    '}',
                '}',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value of []) {',
                'function require() {}',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value of []) {',
                'require();',
                'function require() {}',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value of []) {',
                'require();',
                'var require = function () {};',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value of []) {',
                'var require = function () {};',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var require = function () {};',
            'for (var value of []) {',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require() {};',
            'for (var value of []) {',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value in {}) {',
                'function require() {}',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value in {}) {',
                'require();',
                'function require() {}',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value in {}) {',
                'require();',
                'var require = function () {};',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var value in {}) {',
                'var require = function () {};',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var require = function () {};',
            'for (var value in {}) {',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require() {};',
            'for (var value in {}) {',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var i = 0; i < 2; i++) {',
                'function require() {}',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var i = 0; i < 2; i++) {',
                'require();',
                'function require() {}',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var i = 0; i < 2; i++) {',
                'require();',
                'var require = function () {};',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'for (var i = 0; i < 2; i++) {',
                'var require = function () {};',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var require = function () {};',
            'for (var i = 0; i < 2; i++) {',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require() {};',
            'for (var i = 0; i < 2; i++) {',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'var require = function () {};',
            'do {',
                'i++;',
                'require();',
            '}',
            'while (i < 6);'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'function require() {};',
            'do {',
                'i++;',
                'require();',
            '}',
            'while (i < 6);'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'do {',
                'i++;',
                'function require() {};',
                'require();',
            '}',
            'while (i < 6);'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'do {',
                'i++;',
                'require();',
                'function require() {};',
            '}',
            'while (i < 6);'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'do {',
                'i++;',
                'var require = function() {};',
                'require();',
            '}',
            'while (i < 6);'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'do {',
                'i++;',
                'require();',
                'var require = function() {};',
            '}',
            'while (i < 6);'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'function require() {}',
            'while (i < 6) {',
                'i++;',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'var require = function () {};',
            'while (i < 6) {',
                'i++;',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'while (i < 6) {',
                'i++;',
                'var require = function () {};',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'while (i < 6) {',
                'i++;',
                'require();',
                'var require = function () {};',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'while (i < 6) {',
                'i++;',
                'function require() {}',
                'require();',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'var i = 0;',
            'while (i < 6) {',
                'i++;',
                'require();',
                'function require() {}',
            '}'
        ].join(''),
        [
            'import path from "path";',
            'function require() {};',
            'try {}',
            'catch(e) {}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'var require = function () {};',
            'try {}',
            'catch(e) {}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {',
                'const require = function () {};',
                'require();',
            '}',
            'catch(e) {',
            '}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {',
                'require();',
                'const require = function () {};',
            '}',
            'catch(e) {',
            '}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {',
                'function require() {};',
                'require();',
            '}',
            'catch(e) {',
            '}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {',
                'require();',
                'function require() {};',
            '}',
            'catch(e) {',
            '}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {}',
            'catch(e) {',
                'require();',
                'function require() {};',
            '}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {}',
            'catch(e) {',
                'function require() {};',
                'require();',
            '}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {}',
            'catch(e) {',
                'var require = function () {};',
                'require();',
            '}',
            'require();'
        ].join(''),
        [
            'import path from "path";',
            'try {}',
            'catch(e) {',
                'require();',
                'var require = function () {};',
            '}',
            'require();'
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
        {
            /* eslint-disable fecs-indent */
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
            /* eslint-enable fecs-indent */
            errors: [
                {
                    message: 'Expected `import` but found `require`.',
                    type: 'CallExpression'
                },
                {
                    message: 'Expected `import` but found `require`.',
                    type: 'CallExpression'
                },
                {
                    message: 'Expected `import` but found `require`.',
                    type: 'CallExpression'
                },
                {
                    message: 'Expected `import` but found `require`.',
                    type: 'CallExpression'
                },
                {
                    message: 'Expected `import` but found `require`.',
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'require("http")',
            errors: [{
                message: 'Expected `import` but found `require`.',
                type: 'CallExpression'
            }]
        },
        {
            code: 'require("path")',
            errors: [{
                message: 'Expected `import` but found `require`.',
                type: 'CallExpression'
            }]
        }
    ]
});
