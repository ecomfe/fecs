/**
 * @file Tests for valid-dom-style.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/valid-dom-style');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('valid-dom-style', rule, {

    valid: [
        'foo = 200;',
        'foo.width = 200;',
        'foo.Style.height = 200;',
        'foo.style.left = 200;',
        'foo.bar.style.top = 200;',
        'function setWidth(foo) {\nfoo.style.margin = 200;\n}',
        'var foo = $("foo");\nfoo.style.padding = "200px";',
        '$("foo").style.fontSize = "200px";'
    ],

    invalid: [
        {
            code: 'document.getElementById("foo").style.width = "200px";',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'document.querySelectorAll(".foo")[0].style.top = 0;',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'document.getElementsByTagName("div")[0].style.height = "100%";',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'document.querySelector(".foo").style.margin = 200;',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                },
                {
                    message: 'Expected to assign `margin` with unit suffix value.',
                    type: 'Literal'
                }
            ]
        },
        {
            code: 'document.querySelector(".foo").style.clip = "rect(auto 5px 5px auto)";',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'document.querySelector(".foo").style.clip = "rect(auto 5 5px auto)";',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                },
                {
                    message: 'Expected to assign `clip` with unit suffix value.',
                    type: 'Literal'
                }
            ]
        },
        {
            code: 'document.querySelector(".foo").style.borderLeft = "10px solid rgb(200,0 100)";',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                }
            ]
        },
        {
            code: 'document.querySelector(".foo").style.borderLeft = "10 solid rgb(200,0 100)";',
            errors: [
                {
                    message: 'Expected to change style via className.',
                    type: 'Identifier'
                },
                {
                    message: 'Expected to assign `borderLeft` with unit suffix value.',
                    type: 'Literal'
                }
            ]
        }
    ]
});
