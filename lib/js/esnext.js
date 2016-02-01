/**
 * @file hack eslint for es-next rules
 * @author chris<wfsr@foxmail.com>
 */

var allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

var Controller;
allowUnsafeNewFunction(function () {
    Controller = require('eslint/lib/util/estraverse').Controller;
});

var SourceCode;
allowUnsafeNewFunction(function () {
    SourceCode = require('eslint').SourceCode;
});


var ESNEXT_NODETYPES = {
    AssignmentPattern: 1,
    ArrayPattern: 1,
    ArrowFunctionExpression: 1,
    ClassBody: 1,
    ClassDeclaration: 1,
    ClassExpression: 1,
    Decorator: 1,
    ExperimentalRestProperty: 1,
    ExperimentalSpreadProperty: 1,
    ForOfStatement: 1,
    MetaProperty: 1,
    MethodDefinition: 1,
    ObjectPattern: 1,
    RestElement: 1,
    SpreadElement: 1,
    Super: 1,
    TaggedTemplateExpression: 1,
    TemplateElement: 1,
    TemplateLiteral: 1,
    YieldExpression: 1,
    JSXIdentifier: 1,
    JSXNamespacedName: 1,
    JSXMemberExpression: 1,
    JSXEmptyExpression: 1,
    JSXExpressionContainer: 1,
    JSXElement: 1,
    JSXClosingElement: 1,
    JSXOpeningElement: 1,
    JSXAttribute: 1,
    JSXSpreadAttribute: 1,
    JSXText: 1,
    ExportDefaultDeclaration: 1,
    ExportNamedDeclaration: 1,
    ExportAllDeclaration: 1,
    ExportSpecifier: 1,
    ImportDeclaration: 1,
    ImportSpecifier: 1,
    ImportDefaultSpecifier: 1,
    ImportNamespaceSpecifier: 1
};

var GENERATOR_NODETYPES = {
    FunctionDeclaration: 1,
    FunctionExpression: 1
};

/**
 * check es-next code
 *
 * @param {AST} ast AST Object
 * @param {Object} config eslint config options
 * @param {string} path file path
 */
exports.checkNext = function (ast, config, path) {
    var controller = new Controller();
    var isNext = false;

    if (/\.es6?$/.test(path)) {
        isNext = true;
    }
    else if ('es6' in config.env) {
        isNext = !!config.env.es6;
    }
    else if ('ecmaFeatures' in config) {
        isNext = Object.keys(config.ecmaFeatures).some(function (key) {
            return !!config.ecmaFeatures[key];
        });
    }
    else {
        controller.traverse(ast, {
            enter: function (node) {
                if (
                    ESNEXT_NODETYPES[node.type]
                    || (node.generator || node.async) && GENERATOR_NODETYPES[node.type]
                ) {
                    isNext = true;
                    this.break();
                }
            }
        });
    }

    exports.toggleESRules(config, isNext);

};

var ESNEXT_RULES = [
    'fecs-jsx-var', 'arrow-parens', 'arrow-spacing', 'constructor-super', 'generator-star-spacing',
    'no-arrow-condition', 'no-class-assign', 'no-const-assign', 'no-dupe-class-members', 'no-this-before-super',
    'no-var', 'fecs-esnext-ext'
];

/**
 * open or close rules for es-next
 *
 * @param {Object} config eslint config options
 * @param {boolean} open open rules for es-next if true, or close
 */
exports.toggleESRules = function (config, open) {
    ESNEXT_RULES.reduce(function (rules, name) {
        /* istanbul ignore else */
        if (name in rules) {
            if (typeof rules[name] === 'number') {
                rules[name] =  open ? (rules[name] || 2) : 0;
            }
            else {
                rules[name][0] =  open ? (rules[name][0] || 2) : 0;
            }
        }
        return rules;
    }, config.rules);
};

/**
 * parse ast and wrap with eslint.SourceCode
 * from module:eslint~parse
 *
 * @param {string} text js code contents
 * @param {Object} config eslint config options
 * @param {string} path file path
 * @return {eslint.SourceCode}
 */
exports.parse = function (text, config, path) {
    var parser = require(config.parser);
    var ast;
    var shebang;

    text = text.replace(/^#!([^\r\n]+)/, function (match, captured) {
        shebang = captured;
        return '//' + captured;
    });

    try {
        ast = parser.parse(text, {
            loc: true,
            range: true,
            raw: true,
            tokens: true,
            comment: true,
            attachComment: true,
            ecmaFeatures: config.ecmaFeatures
        });
    }
    catch (e) {
        // If the message includes a leading line number, strip it:
        var message = e.message.replace(/^line \d+:/i, '').trim();

        e.message = 'Parsing error: ' + message;
        e.severity = 2;
        e.column++;

        throw e;
    }

    // remove shebang comments
    if (shebang && ast.comments.length && ast.comments[0].value === shebang) {
        ast.comments.splice(0, 1);

        if (ast.body.length && ast.body[0].leadingComments && ast.body[0].leadingComments[0].value === shebang) {
            ast.body[0].leadingComments.splice(0, 1);
        }
    }

    exports.checkNext(ast, config, path);

    return new SourceCode(text, ast);
};
