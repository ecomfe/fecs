/**
 * @file Tests for prefer-async-await
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../../lib/js/rules/prefer-async-await');
var RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({parser: 'babel-eslint'});

ruleTester.run('prefer-async-await', rule, {
    valid: [
        {
            code: ''
                + 'async function requestData() {\n'
                + '    let tags = await requestTags();\n'
                + '    let articles;\n'
                + '    if (tags.id) {\n'
                + '        articles = await requestArticles();\n'
                + '    }\n'
                + '\n'
                + '    return Promise.resolve({tags, articles});\n'
                + '}\n'
        },
        {
            code: ''
                + 'async function addReport(report, userId) {\n'
                + '    let user = await getUser(userId);\n'
                + '    let isValid = await validateUser(user);\n'
                + '\n'
                + '    if (isValid) {\n'
                + '        let savePromise = saveReport(report, user);\n'
                + '        return savePromise();\n'
                + '    }\n'
                + '\n'
                + '    return Promise.reject("Invalid");\n'
                + '}\n'
        },
        {
            code: ''
                + 'async function addReport(report, userId) {\n'
                + '    let user = await getUser(userId);\n'
                + '    let isValid;\n'
                + '    isValid = await validateUser(user);\n'
                + '\n'
                + '    if (isValid) {\n'
                + '        let savePromise = saveReport(report, user);\n'
                + '        return savePromise();\n'
                + '    }\n'
                + '\n'
                + '    return Promise.reject("Invalid");\n'
                + '}\n'
        },
        {
            code: ''
                + 'async function requestData() {\n'
                + '    const [tags, articles] = await Promise.all([\n'
                + '        requestTags(),\n'
                + '        requestArticles()\n'
                + '    ]);\n'
                + '    return {tags, articles};\n'
                + '}\n'
        },
        {
            code: 'var co = require("co");',
            options: [{co: true}]
        },
        {
            code: ''
                + 'function addReport(report, userId) {\n'
                + '    return co(function* () {\n'
                + '        let user = yield getUser(userId);\n'
                + '        let isValid = yield validateUser(user);\n'
                + '\n'
                + '        if (isValid) {\n'
                + '            let savePromise = saveReport(report, user);\n'
                + '            return savePromise();\n'
                + '        }\n'
                + '\n'
                + '        return Promise.reject("Invalid");\n'
                + '    });\n'
                + '}\n',
            options: [{co: true}]
        }
    ],
    invalid: [
        {
            code: ''
                + 'async function requestData() {\n'
                + '    let tags = await requestTags();\n'
                + '    let articles = await requestArticles();\n'
                + '\n'
                + '    return Promise.resolve({tags, articles});\n'
                + '}\n',
            errors: [{
                line: 3,
                type: 'YieldExpression',
                message: 'Expected to excute in parallel.'
            }]
        },
        {
            code: 'var co = require("co");',
            errors: [{
                line: 1,
                type: 'CallExpression',
                message: 'Expected to use `async` and `await`.'
            }]
        },
        {
            code: ''
                + 'function addReport(report, userId) {\n'
                + '    return co(function* () {\n'
                + '        let user = yield getUser(userId);\n'
                + '        let isValid = yield validateUser(user);\n'
                + '\n'
                + '        if (isValid) {\n'
                + '            let savePromise = saveReport(report, user);\n'
                + '            return savePromise();\n'
                + '        }\n'
                + '\n'
                + '        return Promise.reject("Invalid");\n'
                + '    });\n'
                + '}\n',
            errors: [{
                line: 2,
                type: 'CallExpression',
                message: 'Expected to use `async` and `await`.'
            }]
        },
        {
            code: ''
                + 'function addReport(report, userId) {\n'
                + '    return co(function* () {\n'
                + '        let user = yield getUser(userId);\n'
                + '        let isValid = yield validateUser(user);\n'
                + '\n'
                + '        if (isValid) {\n'
                + '            let savePromise = saveReport(report, user);\n'
                + '            return savePromise();\n'
                + '        }\n'
                + '\n'
                + '        return Promise.reject("Invalid");\n'
                + '    });\n'
                + '}\n',
            options: [{co: false}],
            errors: [{
                line: 2,
                type: 'CallExpression',
                message: 'Expected to use `async` and `await`.'
            }]
        }
    ]
});
