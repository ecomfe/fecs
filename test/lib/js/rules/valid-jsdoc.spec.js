/**
 * @file Check JSDoc styles.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

/* eslint-disable max-len */
// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------
var rule = require('../../../../lib/js/rules/valid-jsdoc');
var RuleTester = require('eslint').RuleTester;
// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------
var ruleTester = new RuleTester({
    parser: 'babel-eslint'
});

ruleTester.run('valid-jsdoc', rule, {

    valid: [
        {
            code: [
                '/**',
                ' * foo desc',
                ' *',
                ' * @param {string} bar desc',
                ' */',
                'function foo(bar) {}'
            ].join('\n'),
            options: [
                {
                    requireFileDescription: false,
                    requireAuthor: false,
                    requireReturn: false
                }
            ]
        },
        {
            code: [
                '/*foo-bar*/',
                'function foo(bar) {}'
            ].join('\n'),
            options: [
                {
                    ignore: 'foo-bar'
                }
            ]
        },
        {
            code: [
                '/* foo-bar */',
                'function foo(bar) {}'
            ].join('\n'),
            options: [
                {
                    ignore: ['/\\s*foo-bar\\s*/']
                }
            ]
        },
        '// comment here\nvar foo;',
        '/* jshint max-len: 80 */\nvar foo;',
        '/* istanbul ignore */\nvar foo;',
        '/* eslint-disable max-len */\nvar foo;',
        '/**\n* Description\n * @param {Object[]} screenings Array of screenings.\n * @param {number} screenings.timestamp its a time stamp \n @return {void} */\nfunction foo(){}',
        '/**\n* Description\n */\nvar x = new Foo(function foo(){})',
        '/**\n* Description\n* @returns {void} */\nfunction foo(){}',
        '/**\n* Description\n* @returns {undefined} */\nfunction foo(){}',
        '/**\n* Description\n* @alias Test#test\n* @returns {void} */\nfunction foo(){}',
        '/**\n* Description\n*@extends MyClass\n* @returns {void} */\nfunction foo(){}',
        '/**\n* Description\n* @constructor */\nfunction Foo(){}',
        '/**\n* Description\n* @class */\nfunction Foo(){}',
        '/**\n* Description\n* @param {string} p bar\n* @returns {string} desc */\nfunction foo(p){}',
        '/**\n* Description\n* @arg {string} p bar\n* @returns {string} desc */\nfunction foo(p){}',
        '/**\n* Description\n* @argument {string} p bar\n* @returns {string} desc */\nfunction foo(p){}',
        '/**\n* Description\n* @param {string} [p] bar\n* @returns {string} desc */\nfunction foo(p){}',
        '/**\n* Description\n* @param {Object} p bar\n* @param {string} p.name bar\n* @returns {string} desc */\nFoo.bar = function(p){};',
        '(function(){\n/**\n* Description\n* @param {string} p bar\n* @returns {string} desc */\nfunction foo(p){}\n}())',
        'var o = {\n/**\n* Description\n* @param {string} p bar\n* @returns {string} desc */\nfoo: function(p){}\n};',
        '/**\n* Description\n* @param {Object} p bar\n* @param {string[]} p.files qux\n* @param {Function} cb baz\n* @returns {void} */\nfunction foo(p, cb){}',
        '/**\n* Description\n* @override */\nfunction foo(arg1, arg2){ return \'\'; }',
        '/**\n* Description\n* @inheritdoc */\nfunction foo(arg1, arg2){ return \'\'; }',
        '/**\n* Description\n* @inheritDoc */\nfunction foo(arg1, arg2){ return \'\'; }',
        {
            code: 'call(\n' + '  /**\n' + '   * Doc for a function expression in a call expression.\n' + '   * @param {string} argName This is the param description.\n' + '   * @return {string} This is the return description.\n' + '   */\n' + '  function(argName) {\n' + '    return \'the return\';\n' + '  }\n' + ');\n',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n' + '* Create a new thing.\n' + '*/\n' + 'var thing = new Thing({\n' + '  foo: function() {\n' + '    return \'bar\';\n' + '  }\n' + '});\n',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n' + '* Create a new thing.\n' + '*/\n' + 'var thing = new Thing({\n' + '  /**\n' + '   * @return {string} A string.\n' + '   */\n' + '  foo: function() {\n' + '    return \'bar\';\n' + '  }\n' + '});\n',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @return {void} */\nfunction foo(){}',
            options: [
                {}
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p bar\n*/\nFoo.bar = (p) => {};',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n* Description\n* @param {string} p bar\n*/\nFoo.bar = function({p}){};',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n* Description\n* @param {string} p bar\n*/\nFoo.bar = function(p){};',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p mytest\n*/\nFoo.bar = function(p){var t = function(){return p;}};',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p mytest\n*/\nFoo.bar = function(p){function func(){return p;}};',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p mytest\n*/\nFoo.bar = function(p){var t = false; if(t){ return; }};',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p mytest\n* @returns {void} */\nFoo.bar = function(p){var t = false; if(t){ return; }};',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p mytest\n*/\nFoo.bar = function(p){var t = function(){function name(){return p;}}};',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p mytest\n*/\nFoo.bar = function(p){var t = function(){function name(){}; return name;}};',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p\n* @returns {void}*/\nFoo.bar = function(p){var t = function(){function name(){}; return name;}};',
            options: [
                {
                    requireParamDescription: false
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} p mytest\n* @returns {Object}*/\nFoo.bar = function(p){return name;};',
            options: [
                {
                    requireReturnDescription: false
                }
            ]
        },
        'var obj = {\n /**\n * Getter\n * @type {string}\n */\n get location() {\n return this._location;\n }\n }',
        'var obj = {\n /**\n * Setter\n * @param {string} value The location\n */\n set location(value) {\n this._location = value;\n }\n }',
        {
            code: '/**\n * Description for A.\n */\n class A {\n /**\n * Description for constructor.\n * @param {object[]} xs - xs\n */\n constructor(xs) {\n /**\n * Description for this.xs;\n * @type {object[]}\n */\n this.xs = xs.filter(x => x != null);\n }\n}',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/** @returns {object} foo */ var foo = () => bar();',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/** @returns {object} foo */ var foo = () => { return bar(); };',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/** foo */ var foo = () => { bar(); };',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n* Start with caps and end with period.\n* @returns {void} */\nfunction foo(){}',
            options: [
                {
                    matchDescription: '^[A-Z][A-Za-z0-9\\s]*[.]$'
                }
            ]
        },
        {
            code: '/** Foo \n@return {void} Foo\n */\nfunction foo(){}',
            options: [
                {
                    prefer: {
                        'return': 'return'
                    }
                }
            ]
        },
        {
            code: '/** Foo \n@return Foo\n */\nfunction foo(){}',
            options: [
                {
                    requireReturnType: false
                }
            ]
        },
        {
            code: '/**\n' + ' * A thing interface. \n' + ' * @interface\n' + ' */\n' + 'function Thing() {}',
            options: [
                {
                    requireReturn: true
                }
            ]
        },
        // classes
        {
            code: '/**\n' + ' * Description for A.\n' + ' */\n' + 'class A {\n' + '    /**\n' + '     * Description for constructor.\n' + '     * @param {object[]} xs - xs\n' + '     */\n' + '    constructor(xs) {\n' + '        this.a = xs;' + '    }\n' + '}',
            options: [
                {
                    requireReturn: true
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n' + ' * Description for A.\n' + ' */\n' + 'class A {\n' + '    /**\n' + '     * Description for method.\n' + '     * @param {object[]} xs - xs\n' + '     */\n' + '    print(xs) {\n' + '        this.a = xs;' + '    }\n' + '}',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n' + ' * Description for A.\n' + ' */\n' + 'class A {\n' + '    /**\n' + '     * Description for constructor.\n' + '     * @param {object[]} xs - xs\n' + '     * @returns {void}\n' + '     */\n' + '    constructor(xs) {\n' + '        this.a = xs;' + '    }\n' + '    /**\n' + '     * Description for method.\n' + '     * @param {object[]} xs - xs\n' + '     * @returns {void}\n' + '     */\n' + '    print(xs) {\n' + '        this.a = xs;' + '    }\n' + '}',
            options: [],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n' + ' * Use of this with a \'namepath\'.\n' + ' * @this some.name\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n' + ' * Use of this with a type expression.\n' + ' * @this {some.name}\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        // type validations
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<*>} hi - desc\n' + '* @returns {*} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string',
                        Astnode: 'ASTNode'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {string} hi - desc\n' + '* @returns {ASTNode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string',
                        Astnode: 'ASTNode'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {{20:string}} hi - desc\n' + '* @returns {Astnode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string',
                        astnode: 'ASTNode'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {String|number|Test} hi - desc\n' + '* @returns {Astnode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        test: 'Test'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<string>} hi - desc\n' + '* @returns {Astnode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string',
                        astnode: 'ASTNode'
                    }
                }
            ]
        },
        {
            code: '/**\n' + ' * Test dash and slash.\n' + ' * @extends module:stb/emitter~Emitter\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n' + ' * Test dash and slash.\n' + ' * @requires module:config\n' + ' * @requires module:modules/notifications\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n' + ' * Foo\n' + ' * @module module-name\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n' + ' * Foo\n' + ' * @alias module:module-name\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<string>} hi - desc\n' + '* @returns {Array.<string|number>} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<string|number>} hi - desc\n' + '* @returns {Array.<string>} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<{id: number, votes: number}>} hi - desc\n' + '* @returns {Array.<{summary: string}>} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        Number: 'number',
                        String: 'string'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<[string, number]>} hi - desc\n' + '* @returns {Array.<[string, string]>} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        Number: 'number',
                        String: 'string'
                    }
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Object<string,Object<string, number>>} hi - because why not\n' + '* @returns {Boolean} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        Number: 'number',
                        String: 'string'
                    }
                }
            ]
        },
        {
            code: '/**\n* Description\n* @param {string} a bar\n* @returns {string} desc */\nfunction foo(a = 1){}',
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n* Description\n* @param {string} b bar\n* @param {string} a bar\n* @returns {string} desc */\nfunction foo(b, a = 1){}',
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' * @return {Promise<object>} bar desc',
                ' */',
                'function foo() {return new Promise()}'
            ].join('\n'),
            options: [
                {
                    preferType: {promise: 'Promise'}
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' * @return {Promise<object, boolean>} bar desc',
                ' */',
                'function foo() {return new Promise()}'
            ].join('\n'),
            options: [
                {
                    preferType: {promise: 'Promise'}
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @file foo',
                ' * @author chris',
                ' */'
            ].join('\n'),
            options: [
                {
                    requireAuthor: true,
                    requireFileDescription: true
                }
            ]
        },

        {
            code: [
                '/**',
                ' * @fileoverview foo',
                ' * @author chris',
                ' */'
            ].join('\n'),
            options: [
                {
                    requireAuthor: true,
                    requireFileDescription: true
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @file module foo',
                ' *',
                ' * @param {string} bar desc',
                ' */',
                'exports.foo = function (bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireFileDescription: true
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo',
                ' *',
                ' * @param {...string} bar desc',
                ' */',
                'exports.foo = function (...bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo',
                ' *',
                ' * @param {string} bar desc',
                ' */',
                'exports.foo = function (bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireEmptyLineBeforeComment: true
                }
            ]
        },
        {
            code: [
                'exports.bar = 1;',
                '',
                '/**',
                ' * foo',
                ' *',
                ' * @param {string} bar desc',
                ' */',
                'exports.foo = function (bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireEmptyLineBeforeComment: true
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @param {string} bar desc',
                ' */',
                'exports.foo = function (bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireDescription: false
                }
            ]
        },
        {
            code: '/**\n* @override\n */\nfunction foo(b){}',
            options: [
                {
                    requireReturn: false,
                    requireDescription: true
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @param {Object} context.a',
                ' * @param {string} context.a.b',
                ' * @param {string} context.a.c',
                ' */',
                'function foo({a: {b, c}}){}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireDescription: false,
                    requireParamDescription: false,
                    requireObjectPatternParamBranchName: true
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @param {Object} context',
                ' * @param {Object} context.a',
                ' * @param {string} context.a.b',
                ' * @param {string} context.a.c',
                ' */',
                'function foo({a: {b, c}}){}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireDescription: false,
                    requireParamDescription: false,
                    requireObjectPatternParamBranchName: true
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @param {Object} a',
                ' * @param {string} b',
                ' * @param {string} c',
                ' */',
                'function foo({a: {b, c}}){}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireDescription: false,
                    requireParamDescription: false,
                    requireObjectPatternParamBranchName: true
                }
            ]
        },
        {
            code: '/**\n* @param {string} b\n* @param {string} c\n */\nfunction foo({a: {b, c}}){}',
            options: [
                {
                    requireReturn: false,
                    requireDescription: false,
                    requireParamDescription: false,
                    requireObjectPatternParamBranchName: false
                }
            ]
        },
        {
            code: '/**\n* @param {Object} options\n* @param {?string} options.a\n */\nfunction foo(options){}',
            options: [
                {
                    requireReturn: false,
                    requireDescription: false,
                    requireParamDescription: false
                }
            ]
        },
        {
            code: '/**\n* @return {Object}\n* @abstract\n */\nfunction foo(){}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* @return {Object}\n */\nvar foo = async function (){}',
            options: [
                {
                    requireReturn: false
                }
            ]
        },
        {
            code: '/**\n* @return {Object}\n */\nvar foo = function *(){}',
            options: [
                {
                    requireReturn: false
                }
            ]
        }
    ],

    invalid: [
        {
            code: [
                '/**',
                ' * @param {Object} context.a',
                ' * @param {string} context.a.b',
                ' */',
                'function foo({a: {b, c}}){}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireDescription: false,
                    requireParamDescription: false,
                    requireObjectPatternParamBranchName: true
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc for parameter "c".baidu052',
                    line: 2,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/*',
                ' * foo desc',
                ' *',
                ' * @param {string} bar desc',
                ' */',
                'function foo(bar) {}'
            ].join('\n'),
            errors: [
                {
                    message: 'JSDoc opent tag should be `/**`, not `/*`.baidu040',
                    line: 1,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/*',
                ' * foo desc',
                ' *',
                ' */',
                'function foo(bar) {}'
            ].join('\n'),
            errors: [
                {
                    message: 'Expected to use LineComment but saw BlockComment.baidu039',
                    line: 1,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/*foo-bar*/',
                'function foo(bar) {}'
            ].join('\n'),
            errors: [
                {
                    message: 'Expected to use LineComment but saw BlockComment.baidu039',
                    line: 1,
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\nfoo\n * @constructor\n * @returns {Object} bar\n */\nfunction Foo() {}',
            options: [
                {
                    prefer: {returns: 'return', constructor: 'class'},
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Use @class instead.baidu048',
                    line: 3,
                    type: 'Block'
                },
                {
                    message: 'Unexpected @returns tag; function has no return statement.baidu998',
                    line: 4,
                    type: 'Block'
                }
            ]
        },
        {
            code: '/* just a comment */',
            options: [
                {
                    requireAuthor: true,
                    requireFileDescription: true
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @file.baidu045',
                    line: 1,
                    type: 'Program'
                },
                {
                    message: 'Missing JSDoc @author.baidu046',
                    line: 1,
                    type: 'Program'
                },
                {
                    message: 'Expected to use LineComment but saw BlockComment.baidu039',
                    line: 1,
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** just a comment */',
            options: [
                {
                    requireAuthor: true,
                    requireFileDescription: true
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @file.baidu045',
                    line: 1,
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc @author.baidu046',
                    line: 1,
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n * @fileoverview foo*/',
            options: [
                {
                    prefer: {fileoverview: 'file'},
                    requireFileDescription: true
                }
            ],
            errors: [
                {
                    message: 'Use @file instead.baidu045',
                    line: 2,
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n * @file foo*/',
            options: [
                {
                    prefer: {file: 'fileoverview'},
                    requireFileDescription: true
                }
            ],
            errors: [
                {
                    message: 'Use @fileoverview instead.baidu998',
                    line: 2,
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* @param {string} b\n* @param {string} c\n */\nfunction foo({a: {b, c}}){}',
            options: [
                {
                    requireReturn: false,
                    requireDescription: false,
                    requireParamDescription: false,
                    requireObjectPatternParamBranchName: true
                }
            ],
            errors: [
                {
                    message: 'Expected JSDoc for "a" but found "b".baidu052',
                    line: 2,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @param {string} bar desc',
                ' */',
                'exports.foo = function (bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireDescription: true
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc description.baidu052',
                    line: 2,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                'exports.bar = 1;',
                '/**',
                ' * foo',
                ' *',
                ' * @param {string} bar desc',
                ' */',
                'exports.foo = function (bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireEmptyLineBeforeComment: true
                }
            ],
            errors: [
                {
                    message: 'Expected an empty line before JSDoc comment.baidu041',
                    line: 2,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo',
                ' *',
                ' * @param {Array.<string>} bar desc',
                ' */',
                'exports.foo = function (...bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Expected a rest type({...<Type>}) for rest parameter "bar".baidu044',
                    line: 4,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @param {string} bar desc',
                ' */',
                'exports.foo = function (bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireFileDescription: true
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @file.baidu045',
                    line: 1,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * @fileoverview foo',
                ' */'
            ].join('\n'),
            options: [
                {
                    requireAuthor: true
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @author.baidu046',
                    line: 1,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' * @return {Promise.<Object, boolean, boolean>} bar desc',
                ' */',
                'function foo() {return new Promise()}'
            ].join('\n'),
            options: [
                {
                    preferType: {promise: 'Promise'}
                }
            ],
            errors: [
                {
                    message: ''
                     + 'Expected JSDoc type name "Promise.<resolveType[, rejectType]>" '
                     + 'but "Promise.<Object, boolean, boolean>" found.baidu044',
                    line: 3,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' * @param {string} bar desc',
                ' */',
                'function foo(bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false,
                    requireBlankLineAfterDescription: true
                }
            ],
            errors: [
                {
                    message: 'Expected a blank comment line between description and tags.baidu997',
                    line: 3,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' * @return {promise} bar desc',
                ' */',
                'function foo() {return new Promise()}'
            ].join('\n'),
            options: [
                {
                    preferType: {promise: 'Promise'}
                }
            ],
            errors: [
                {
                    message: 'Use "Promise" instead of "promise".baidu044',
                    line: 3,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' * @return {promise<object, boolean>} bar desc',
                ' */',
                'function foo() {return new Promise()}'
            ].join('\n'),
            options: [
                {
                    preferType: {promise: 'Promise'}
                }
            ],
            errors: [
                {
                    message: 'Use "Promise" instead of "promise".baidu044',
                    line: 3,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' * @return {promise.<object, boolean, string>} bar desc',
                ' */',
                'function foo() {return new Promise()}'
            ].join('\n'),
            options: [
                {
                    preferType: {promise: 'Promise'}
                }
            ],
            errors: [
                {
                    message: 'Use "Promise" instead of "promise".baidu044',
                    line: 3,
                    type: 'Block'
                },
                {
                    message: ''
                        + 'Expected JSDoc type name "Promise.<resolveType[, rejectType]>" '
                        + 'but "promise.<object, boolean, string>" found.baidu044',
                    line: 3,
                    type: 'Block'
                }
            ]
        },
        {
            code: [
                '/**',
                ' * foo desc',
                ' *',
                ' * @param {string} baz desc',
                ' */',
                'function foo(bar) {}'
            ].join('\n'),
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Expected JSDoc for "bar" but found "baz".baidu052',
                    line: 4,
                    type: 'Block'
                }
            ]
        },
        {
            code: 'call(\n' + '  /**\n' + '   * Doc for a function expression in a call expression.\n' + '   * @param {string} bogusName This is the param description.\n' + '   * @return {string} This is the return description.\n' + '   */\n' + '  function(argName) {\n' + '    return \'the return\';\n' + '  }\n' + ');\n',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Expected JSDoc for "argName" but found "bogusName".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** @@foo */\nfunction foo(){}',
            errors: [
                {
                    message: 'JSDoc syntax error: Missing or invalid title.baidu999',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + '* Create a new thing.\n' + '*/\n' + 'var thing = new Thing({\n' + '  /**\n' + '   * Missing return tag.\n' + '   */\n' + '  foo: function() {\n' + '    return \'bar\';\n' + '  }\n' + '});\n',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** @@returns {void} Foo */\nfunction foo(){}',
            errors: [
                {
                    message: 'JSDoc syntax error: Missing or invalid title.baidu999',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@returns {void Foo\n */\nfunction foo(){}',
            errors: [
                {
                    message: 'JSDoc type missing brace.baidu043',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@return {void} Foo\n */\nfunction foo(){}',
            options: [
                {
                    prefer: {
                        'return': 'returns'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use @returns instead.baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@argument {int} bar baz\n */\nfunction foo(bar){}',
            options: [
                {
                    prefer: {
                        argument: 'arg'
                    }
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                },
                {
                    message: 'Use @arg instead.baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n */\nfunction foo(){}',
            options: [
                {
                    prefer: {
                        returns: 'return'
                    }
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @return for function.baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@return {void} Foo\n */\nfoo.bar = () => {}',
            options: [
                {
                    prefer: {
                        'return': 'returns'
                    }
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            },
            errors: [
                {
                    message: 'Use @returns instead.baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@param {void Foo\n */\nfunction foo(){}',
            errors: [
                {
                    message: 'JSDoc type missing brace.baidu043',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@param {} p Bar\n */\nfunction foo(){}',
            errors: [
                {
                    message: 'JSDoc syntax error: unexpected token.baidu999',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@param {void Foo */\nfunction foo(){}',
            errors: [
                {
                    message: 'JSDoc type missing brace.baidu043',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo\n* @param p Desc \n*/\nfunction foo(){}',
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc parameter type for "p".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} p \n*/\nfunction foo(){}',
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc parameter description for "p".baidu053',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} p \n*/\nvar foo = function(){}',
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc parameter description for "p".baidu053',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} p \n*/\nvar foo = \nfunction(){}',
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc parameter description for "p".baidu053',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + ' * Description for a\n' + ' */\n' + 'var A = \n' + '  class {\n' + '    /**\n' + '     * Description for method.\n' + '     * @param {object[]} xs - xs\n' + '     */\n' + '    print(xs) {\n' + '        this.a = xs;' + '    }\n' + '};',
            options: [
                {
                    requireReturn: true,
                    matchDescription: '^[A-Z][A-Za-z0-9\\s]*[.]$'
                }
            ],
            errors: [
                {
                    message: 'JSDoc description does not satisfy the regex pattern(/^[A-Z][A-Za-z0-9\\s]*[.]$/).baidu997',
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n* Foo\n* @returns {string} \n*/\nfunction foo(){}',
            errors: [
                {
                    message: 'Missing JSDoc return description.baidu053',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @returns {string} something \n*/\nfunction foo(p){}',
            errors: [
                {
                    message: 'Missing JSDoc for parameter "p".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @returns {string} something \n*/\nvar foo = \nfunction foo(a = 1){}',
            parserOptions: {
                ecmaVersion: 6
            },
            errors: [
                {
                    message: 'Missing JSDoc for parameter "a".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} a Description \n* @param {string} b Description \n* @returns {string} something \n*/\nvar foo = \nfunction foo(b, a = 1){}',
            parserOptions: {
                ecmaVersion: 6
            },
            errors: [
                {
                    message: 'Expected JSDoc for "b" but found "a".baidu052',
                    type: 'Block'
                },
                {
                    message: 'Expected JSDoc for "a" but found "b".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} p desc\n* @param {string} p desc \n*/\nfunction foo(){}',
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                },
                {
                    message: 'Duplicate JSDoc parameter "p".baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} a desc\n@returns {void}*/\nfunction foo(b){}',
            errors: [
                {
                    message: 'Expected JSDoc for "b" but found "a".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @override\n* @param {string} a desc\n */\nfunction foo(b){}',
            errors: [
                {
                    message: 'Expected JSDoc for "b" but found "a".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @inheritdoc\n* @param {string} a desc\n */\nfunction foo(b){}',
            errors: [
                {
                    message: 'Expected JSDoc for "b" but found "a".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} a desc\n*/\nfunction foo(a){var t = false; if(t) {return t;}}',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} a desc\n*/\nfunction foo(a){var t = false; if(t) {return null;}}',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Foo\n* @param {string} a desc\n@returns {MyClass}*/\nfunction foo(a){var t = false; if(t) {process(t);}}',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Unexpected @returns tag; function has no return statement.baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n * Does something. \n* @param {string} a - this is a \n* @return {Array<number>} The result of doing it \n*/\n export function doSomething(a) { }',
            options: [
                {
                    prefer: {
                        'return': 'returns'
                    }
                }
            ],
            parserOptions: {
                sourceType: 'module'
            },
            errors: [
                {
                    message: 'Use @returns instead.baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n * Does something. \n* @param {string} a - this is a \n* @return {Array<number>} The result of doing it \n*/\n export default function doSomething(a) { }',
            options: [
                {
                    prefer: {
                        'return': 'returns'
                    }
                }
            ],
            parserOptions: {
                sourceType: 'module'
            },
            errors: [
                {
                    message: 'Use @returns instead.baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** foo */ var foo = () => bar();',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            },
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** foo */ var foo = () => { return bar(); };',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            },
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** @returns {object} foo */ var foo = () => { bar(); };',
            options: [
                {
                    requireReturn: false
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            },
            errors: [
                {
                    message: 'Unexpected @returns tag; function has no return statement.baidu998',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* @param fields [Array]\n */\n function foo(){}',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc parameter type for "fields".baidu052',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n* Start with caps and end with period\n* @return {void} */\nfunction foo(){}',
            options: [
                {
                    matchDescription: '^[A-Z][A-Za-z0-9\\s]*[.]$'
                }
            ],
            errors: [
                {
                    message: 'JSDoc description does not satisfy the regex pattern(/^[A-Z][A-Za-z0-9\\s]*[.]$/).baidu997',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@return Foo\n */\nfunction foo(){}',
            options: [
                {
                    prefer: {
                        'return': 'return'
                    }
                }
            ],
            errors: [
                {
                    message: 'Missing JSDoc return type.baidu053',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/** Foo \n@return sdf\n */\nfunction foo(){}',
            options: [
                {
                    prefer: {
                        'return': 'return'
                    },
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'Unexpected @return tag; function has no return statement.baidu998',
                    type: 'Block'
                }
            ]
        },
        // classes
        {
            code: '/**\n' + ' * Description for A\n' + ' */\n' + 'class A {\n' + '    /**\n' + '     * Description for constructor\n' + '     * @param {object[]} xs - xs\n' + '     */\n' + '    constructor(xs) {\n' + '        this.a = xs;' + '    }\n' + '}',
            options: [
                {
                    requireReturn: false,
                    matchDescription: '^[A-Z][A-Za-z0-9\\s]*[.]$'
                }
            ],
            errors: [
                {
                    message: 'JSDoc description does not satisfy the regex pattern(/^[A-Z][A-Za-z0-9\\s]*[.]$/).baidu997',
                    type: 'Block'
                },
                {
                    message: 'JSDoc description does not satisfy the regex pattern(/^[A-Z][A-Za-z0-9\\s]*[.]$/).baidu997',
                    type: 'Block'
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n' + ' * Description for a\n' + ' */\n' + 'var A = class {\n' + '    /**\n' + '     * Description for constructor.\n' + '     * @param {object[]} xs - xs\n' + '     */\n' + '    print(xs) {\n' + '        this.a = xs;' + '    }\n' + '};',
            options: [
                {
                    requireReturn: true,
                    matchDescription: '^[A-Z][A-Za-z0-9\\s]*[.]$'
                }
            ],
            errors: [
                {
                    message: 'JSDoc description does not satisfy the regex pattern(/^[A-Z][A-Za-z0-9\\s]*[.]$/).baidu997',
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n' + ' * Description for A.\n' + ' */\n' + 'class A {\n' + '    /**\n' + '     * Description for constructor.\n' + '     * @param {object[]} xs - xs\n' + '     * @returns {void}\n' + '     */\n' + '    constructor(xs) {\n' + '        this.a = xs;' + '    }\n' + '    /**\n' + '     * Description for method.\n' + '     */\n' + '    print(xs) {\n' + '        this.a = xs;' + '    }\n' + '}',
            options: [],
            errors: [
                {
                    message: 'Missing JSDoc @returns for function.baidu052',
                    type: 'Block'
                },
                {
                    message: 'Missing JSDoc for parameter "xs".baidu052',
                    type: 'Block'
                }
            ],
            parserOptions: {
                ecmaVersion: 6
            }
        },
        {
            code: '/**\n' + ' * Use of this with an invalid type expression\n' + ' * @this {not.a.valid.type.expression\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'JSDoc type missing brace.baidu043',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + ' * Use of this with a type that is not a member expression\n' + ' * @this {Array<string>}\n' + ' */\n' + 'function foo() {}',
            options: [
                {
                    requireReturn: false
                }
            ],
            errors: [
                {
                    message: 'JSDoc syntax error: Invalid name for this.baidu999',
                    type: 'Block'
                }
            ]
        },
        // type validations
        {
            code: '/**\n' + '* Foo\n' + '* @param {String} hi - desc\n' + '* @returns {Astnode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string',
                        Astnode: 'ASTNode'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "ASTNode" instead of "Astnode".baidu044',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {{20:String}} hi - desc\n' + '* @returns {Astnode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string',
                        Astnode: 'ASTNode'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "ASTNode" instead of "Astnode".baidu044',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {String|number|test} hi - desc\n' + '* @returns {Astnode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        test: 'Test'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use "Test" instead of "test".baidu044',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<String>} hi - desc\n' + '* @returns {Astnode} returns a node\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        String: 'string',
                        astnode: 'ASTNode'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<{id: Number, votes: Number}>} hi - desc\n' + '* @returns {Array.<{summary: String}>} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        Number: 'number',
                        String: 'string'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use "number" instead of "Number".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "number" instead of "Number".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {Array.<[String, Number]>} hi - desc\n' + '* @returns {Array.<[String, String]>} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        Number: 'number',
                        String: 'string'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "number" instead of "Number".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                }
            ]
        },
        {
            code: '/**\n' + '* Foo\n' + '* @param {object<String,object<String, Number>>} hi - because why not\n' + '* @returns {Boolean} desc\n' + '*/\n' + 'function foo(hi){}',
            options: [
                {
                    preferType: {
                        Number: 'number',
                        String: 'string',
                        object: 'Object'
                    }
                }
            ],
            errors: [
                {
                    message: 'Use "Object" instead of "object".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "Object" instead of "object".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "string" instead of "String".baidu044',
                    type: 'Block'
                },
                {
                    message: 'Use "number" instead of "Number".baidu044',
                    type: 'Block'
                }
            ]
        }
    ]
});
