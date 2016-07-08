/**
 * @file Check the imports.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/imports-on-top');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('imports-on-top', rule, {

    valid: [
        {
            code: '"use strict";\nimport React from "react"',
            parserOptions: {sourceType: 'module'}
        },
        'import React from "react"',
        '\nimport React from "react"\n',
        '\n   \nimport React from "react"',
        '\n   \nimport React from "react"\n ',
        '\n   \nimport React from "react"\nimport {combineReducers} from "react-redux"',
        '\nimport React from "react";function foo() {}'
    ],

    invalid: [
        {
            code: 'if (true) {}import React from "react";',
            errors: [{
                message: 'All `import` statements must be at the top of the module.',
                type: 'ImportDeclaration'
            }]
        },
        {
            code: 'function foo() {}\nimport React from "react";',
            errors: [{
                message: 'All `import` statements must be at the top of the module.',
                type: 'ImportDeclaration'
            }]
        },
        {
            code: ';;\nimport React from "react";function foo() {}',
            errors: [{
                message: 'All `import` statements must be at the top of the module.',
                type: 'ImportDeclaration'
            }]
        }
    ]
});
