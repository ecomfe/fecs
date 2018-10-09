/**
 * @file hack eslint for es-next rules
 * @author chris<wfsr@foxmail.com>
 */

var allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;


var eslint;
allowUnsafeNewFunction(function () {
    eslint = require('eslint').linter;
});

var Traverser;
allowUnsafeNewFunction(function () {
    Traverser = require('eslint/lib/util/traverser');
});

/**
 * ESNext 特性类型
 */
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
    SpreadProperty: 1,
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

/**
 * 具备生成器特性的类型
 */
var GENERATOR_NODETYPES = {
    FunctionDeclaration: 1,
    FunctionExpression: 1
};

/**
 * 最大遍历节点次数限制
 *
 * @const
 * @type {number}
 */
exports.MAX_TRAVERSE_TIMES = 1000;

/**
 * check es-next code
 *
 * @param {AST} ast AST Object
 * @param {Object} config eslint config options
 * @param {string} path file path
 */
exports.detect = function (ast, config, path) {
    var traverser = new Traverser();
    var isNext = false;

    config.env = config.env || {};

    if (/\.es6?$/.test(path)) {
        isNext = true;
    }
    else if ('es6' in config.env) {
        isNext = !!config.env.es6;
    }
    else {
        if ('ecmaFeatures' in config) {
            isNext = Object.keys(config.ecmaFeatures).some(function (key) {
                return key !== 'globalReturn' && !!config.ecmaFeatures[key];
            });
        }

        if (!isNext) {
            var count = 0;
            var max = exports.MAX_TRAVERSE_TIMES;

            traverser.traverse(ast, {
                enter: function (node) {
                    if (
                        ESNEXT_NODETYPES[node.type]
                        || (node.generator || node.async) && GENERATOR_NODETYPES[node.type]
                        || node.type === 'Property' && (node.computed || node.method || node.shorthand)
                    ) {
                        isNext = true;
                        this.break();
                    }

                    if (++count > max) {
                        this.break();
                    }
                }
            });
        }
    }

    config.env.es6 = isNext;

    exports.toggleESRules(config, isNext);
};

exports.ESNEXT_RULES = [
    'no-var', 'babel/arrow-parens', 'arrow-spacing', 'constructor-super', 'babel/generator-star-spacing',
    'no-duplicate-imports', 'no-arrow-condition', 'prefer-rest-params', 'no-const-assign', 'no-dupe-class-members',
    'no-this-before-super', 'fecs-jsx-var', 'fecs-esnext-ext', 'no-class-assign', 'fecs-use-method-definition',
    'fecs-use-property-shorthand', 'fecs-prefer-class', 'fecs-prefer-super', 'fecs-export-on-declare',
    'fecs-imports-on-top', 'fecs-valid-super', 'fecs-arrow-body-style', 'fecs-max-destructure-depth',
    'fecs-one-var-per-line', 'fecs-no-anonymous-before-rest',
    'fecs-max-calls-in-template', 'fecs-no-extra-destructure', 'fecs-shim-promise',
    'fecs-use-standard-promise', 'fecs-use-for-of', 'fecs-prefer-spread-element', 'fecs-prefer-async-awit',
    'fecs-no-this-arrow', 'fecs-valid-map-set', 'fecs-prefer-destructure', 'fecs-prefer-assign-pattern',
    'fecs-use-computed-property', 'fecs-no-require'
];

/**
 * open or close rules for es-next
 *
 * @param {Object} config eslint config options
 * @param {boolean} open open rules for es-next if true, or close
 */
exports.toggleESRules = function (config, open) {
    exports.ESNEXT_RULES.reduce(function (rules, name) {
        /* istanbul ignore else */
        if (name in rules) {
            if (typeof rules[name] === 'number') {
                rules[name] = open ? (rules[name] || 2) : 0;
            }
            else {
                rules[name][0] = open ? (rules[name][0] || 2) : 0;
            }
        }
        return rules;
    }, config.rules);
};

/**
 * Remove redundant plugins' rules that turn off via `env.pluginName = false`.
 *
 * @param {Object} config eslint config options
 */
exports.removeRedundantRules = function (config) {
    var env = config.env;
    var plugins = config.plugins;

    if (!plugins || !plugins.length) {
        return;
    }

    var offPlugins = [];
    config.plugins = plugins.filter(function (pluginName) {
        // env: {pluginName: false}
        if (env[pluginName] === false) {
            offPlugins.push(pluginName);
            return false;
        }
        return true;
    });

    if (!offPlugins.length) {
        return;
    }

    var rules = config.rules;
    // ['react', 'import'] -> /^(react|import)\//i
    var pattern = new RegExp('^(' + offPlugins.join('|') + ')\/', 'i');

    config.rules = Object.keys(rules).reduce(function (result, ruleName) {
        if (!pattern.test(ruleName)) {
            result[ruleName] = rules[ruleName];
        }
        return result;
    }, {});
};

/**
 * Verifies the text against the rules specified by the second argument.
 *
 * @param {string|SourceCode} textOrSourceCode The text to parse or a SourceCode object.
 * @param {Object} config An object whose keys specify the rules to use.
 * @param {(string|Object)} [filenameOrOptions] The optional filename of the file being checked.
 *      If this is not set, the filename will default to '<input>' in the rule context. If
 *      an object, then it has "filename", "saveState", and "allowInlineConfig" properties.
 * @param {boolean} [saveState] Indicates if the state from the last run should be saved.
 *      Mostly useful for testing purposes.
 * @param {boolean} [filenameOrOptions.allowInlineConfig] Allow/disallow inline comments' ability to change config once it is set. Defaults to true if not supplied.
 *      Useful if you want to validate JS without comments overriding rules.
 * @return {Object[]} The results as an array of messages or null if no messages.
 */
exports.verify = function () {
    return eslint.verify.apply(eslint, arguments);
};
