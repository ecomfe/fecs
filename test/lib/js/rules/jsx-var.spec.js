/**
 * @file Check variables in JSX.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/jsx-var');
var RuleTester = require('eslint').RuleTester;
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('jsx-var', rule, {

    valid: [
        'function aa() {};render(<aa />);',
        'render(<div></div>);',
        'import App from "./app";\nrender(<App visible />);',
        'import App from "./app";\nrender(<App.Foo />);',
        'import App from "./app";\nrender(<App:Foo />);',
        'import App from "./app";\nlet store = createStore();\nrender(<App store={store} />);'
    ],

    invalid: [
        {
            code: 'render(<unknownTagName />);',
            errors: [{
                message: '`unknownTagName` is not defined',
                type: 'JSXIdentifier'
            }]
        },
        {
            code: 'render(<App />);',
            parserOptions: {sourceType: 'script'},
            errors: [{
                message: '`App` is not defined',
                type: 'JSXIdentifier'
            }]
        }
    ]
});
