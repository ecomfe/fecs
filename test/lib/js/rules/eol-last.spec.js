/**
 * @file Check, that file is ended with newline, and there are no multiple empty lines at the end.
 * @author Nodeca Team <https://github.com/nodeca>
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/eol-last');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();

ruleTester.run('eol-last', rule, {

    valid: [
        '',
        '\n',
        '\r\n',
        'var a = 123;\n',
        'var a = 123;\r\n',
        {
            code: 'var a = 123;\n\n',
            options: [true]
        },
        {
            code: 'var a = 123;\n    \n',
            options: [true]
        },
        {
            code: 'var a = 123;\r\n    \r\n',
            options: [true]
        },
        {
            code: 'var a = 123;\r\n\r\n',
            options: [true]
        }
    ],

    invalid: [
        {
            code: 'var a = 123;',
            errors: [{message: 'Newline required at end of file but not found.', type: 'Program'}]
        },
        {
            code: 'var a = 123;\n   ',
            errors: [{message: 'Newline required at end of file but not found.', type: 'Program'}]
        },
        {
            code: 'var a = 123;\r\n   ',
            errors: [{message: 'Newline required at end of file but not found.', type: 'Program'}]
        },
        {
            code: 'var a = 123;\r\n   \r\n',
            errors: [{message: 'Unexpected blank line at end of file.', type: 'Program'}]
        }
    ]
});
