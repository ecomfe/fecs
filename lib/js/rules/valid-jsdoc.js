/**
 * @file Validates JSDoc comments are syntactically correct
 * @author Nicholas C. Zakas
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var doctrine = require('doctrine2');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    var options = context.options[0] || {};
    var prefer = options.prefer || {};
    var preferType = options.preferType || {};
    var checkPreferType = Object.keys(preferType).length !== 0;
    var PROMISE_TYPE = 'Promise.<resolveType[, rejectType]>';

    var requireReturn = options.requireReturn !== false;
    var requireAuthor = options.requireAuthor === true;
    var requireFileDescription = options.requireFileDescription === true;
    var requireParamDescription = options.requireParamDescription !== false;
    var requireReturnType = options.requireReturnType !== false;
    var requireReturnDescription = options.requireReturnDescription !== false;
    var requireBlankLineAfterDescription = options.requireBlankLineAfterDescription === true;
    var requireEmptyLineBeforeComment = options.requireEmptyLineBeforeComment === true;

    var preferLineComment = options.preferLineComment !== false;

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    // Using a stack to store if a function returns or not (handling nested functions)
    var fns = [];

    /**
     * Check if node type is a Class
     *
     * @param {ASTNode} node node to check.
     * @return {boolean} True is its a class
     * @private
     */
    function isTypeClass(node) {
        return node.type === 'ClassExpression' || node.type === 'ClassDeclaration';
    }

    /**
     * When parsing a new function, store it in our function stack.
     *
     * @param {ASTNode} node current node.
     * @private
     */
    function startFunction(node) {
        fns.push({
            returnPresent: (node.type === 'ArrowFunctionExpression' && node.body.type !== 'BlockStatement')
                || isTypeClass(node)
        });
    }

    /**
     * Indicate that return has been found in the current function.
     *
     * @param {ASTNode} node The return node.
     * @return {void}
     * @private
     */
    function addReturn(node) {
        var functionState = fns[fns.length - 1];

        if (functionState && node.argument !== null) {
            functionState.returnPresent = true;
        }
    }


    /**
     * Check if return tag type is void or undefined
     *
     * @param {Object} tag JSDoc tag
     * @return {boolean} True if its of type void or undefined
     * @private
     */
    function isValidReturnType(tag) {
        return tag.type === null || tag.type.name === 'void' || tag.type.type === 'UndefinedLiteral';
    }

    var cachedJSDocNodes = {};

    function getCacheKey(commentNode) {
        var loc = commentNode.loc;
        return [loc.start.line, loc.start.column, loc.end.line, loc.end.column].join('-');
    }

    /**
     * Use doctrine to parse comment node.
     *
     * @param {ASTNode} commentNode comment node from AST
     * @return {?doctrine.tag}
     * @private
     */
    function parseDoc(commentNode) {
        var key = getCacheKey(commentNode);
        if (key in cachedJSDocNodes) {
            return cachedJSDocNodes[key];
        }

        try {
            return (cachedJSDocNodes[key] = doctrine.parse(
                commentNode.value,
                {
                    strict: true,
                    unwrap: true,
                    sloppy: true,
                    lineNumbers: true,
                    recoverable: true
                }
            ));
        }
        catch (ex) {
            var line = commentNode.loc.start.line + (ex.line | 0) + 1;
            var column = commentNode.loc.start.column + (ex.column | 0) + 1;

            if (/braces/i.test(ex.message)) {
                context.report(
                    commentNode,
                    {line: line, column: column},
                    'JSDoc type missing brace.baidu043'
                );
            }
            else {
                context.report(
                    commentNode,
                    {line: line, column: column},
                    'JSDoc syntax error: ' + ex.message + '.baidu999'
                );
            }

            return (cachedJSDocNodes[key] = null);
        }
    }

    /**
     * Get the name of param node
     *
     * @param {ASTNode} node the param node
     * @param {ASTNode[]} params the params
     * @return {string}
     */
    function getParamName(node, params) {
        var type = node.type;

        switch (type) {

            case 'Property':
                return node.key.name;

            case 'RestElement':
                return node.argument.name;

            case 'AssignmentPattern':
                return node.left.name;

            case 'Identifier':
            default:
                return node.name;
        }
    }

    /**
     * check @file  and @author
     *
     * @param {ASTNode} node root node
     * @return {void}
     * @private
     */
    function checkFile(node) {
        if (!requireAuthor && !requireFileDescription) {
            return;
        }

        var fileCommentNode = node.comments.filter(
            function (comment) {
                return comment.type === 'Block' && comment.value[0] === '*';
            }
        )[0];

        var hasFile;
        var hasAuthor;
        if (fileCommentNode) {
            var jsdoc = parseDoc(fileCommentNode);

            jsdoc && jsdoc.tags.forEach(function (tag) {
                switch (tag.title) {
                    case 'file':
                    case 'fileoverview':
                        hasFile = true;

                        if (prefer.hasOwnProperty(tag.title) && tag.title !== prefer[tag.title]) {
                            var code = prefer[tag.title] === 'file' ? '045' : '998';
                            context.report(
                                fileCommentNode,
                                {
                                    line: fileCommentNode.loc.start.line + tag.lineNumber,
                                    column: fileCommentNode.loc.start.column + 1
                                },
                                'Use @{{name}} instead.baidu' + code,
                                {name: prefer[tag.title]}
                            );
                        }

                        break;
                    case 'author':
                        hasAuthor = true;
                        break;
                }
            });
        }

        if (!hasFile && requireFileDescription) {
            context.report(
                fileCommentNode || node,
                {line: 1, column: 0},
                'Missing JSDoc @file.baidu045'
            );
        }

        if (!hasAuthor && requireAuthor) {
            context.report(
                fileCommentNode || node,
                {line: 1, column: 0},
                'Missing JSDoc @author.baidu046'
            );
        }
    }


    /**
     * Check if type should be validated based on some exceptions
     *
     * @param {Object} type JSDoc tag
     * @return {boolean} True if it can be validated
     * @private
     */
    function canTypeBeValidated(type) {
        return type !== 'UndefinedLiteral' // {undefined} as there is no name property available.
            && type !== 'NullLiteral' // {null}
            && type !== 'NullableLiteral' // {?}
            && type !== 'FunctionType' // {function(a)}
            && type !== 'AllLiteral'; // {*}
    }

    /**
     * Extract the current and expected type based on the input type object
     *
     * @param {Object} type JSDoc tag
     * @return {Object} current and expected type object
     * @private
     */
    function getCurrentExpectedTypes(type) {
        var currentType;
        var expectedType;

        if (!type.name) {
            currentType = type.expression.name;
        }
        else {
            currentType = type.name;
        }

        expectedType = preferType[currentType];

        return {
            currentType: currentType,
            expectedType: expectedType
        };
    }

    function getTypes(tag, typesToCheck, jsdocNode, pos, lines) {
        var elements = [];
        var type = tag.type;

        if (type.type === 'ArrayType') {
            elements = type.elements;
        }
        else if (type.type === 'TypeApplication') { // {Array.<String>}
            elements = type.applications[0].type === 'UnionType'
                ? type.applications[0].elements
                : type.applications;
            if (type.expression && type.expression.name.toLowerCase() === 'promise') {
                var name = type.expression.name;
                var raw = lines[tag.lineNumber] + '';

                // Promise.<resolveType, rejectType> nor Promise.<resolveType>
                if (elements.length > 2) {
                    var column = 1 + raw.indexOf('{' + name);
                    if (raw.indexOf('Promise', column) > -1) {
                        column = raw.indexOf('Promise', column);
                    }

                    context.report(
                        jsdocNode,
                        {
                            line: pos.line,
                            column: column
                        },
                        'Expected JSDoc type name "{{name}}" but "{{jsdocName}}" found.baidu044',
                        {
                            name: PROMISE_TYPE,
                            jsdocName: raw.substring(column, raw.indexOf('>', column) + 1)
                        }
                    );
                }
            }
            typesToCheck.push(getCurrentExpectedTypes(type));
        }
        else if (type.type === 'RecordType') { // {{20:String}}
            elements = type.fields;
        }
        else if (type.type === 'UnionType') { // {String|number|Test}
            elements = type.elements;
        }
        else {
            typesToCheck.push(getCurrentExpectedTypes(type));
        }

        elements.forEach(function (type) {
            type = type.value ? type.value : type; // we have to use type.value for RecordType
            if (canTypeBeValidated(type.type)) {
                getTypes({type: type}, typesToCheck, tag, pos, lines);
            }
        });
    }

    /**
     * Check if return tag type is void or undefined
     *
     * @param {Object} tag JSDoc tag
     * @param {Object} jsdocNode JSDoc node
     * @param {Object} pos position of current tag
     * @param {string[]} lines comment node source lines
     * @private
     */
    function validateTagType(tag, jsdocNode, pos, lines) {
        if (!tag.type || !canTypeBeValidated(tag.type.type)) {
            return;
        }

        var typesToCheck = [];
        getTypes(tag, typesToCheck, jsdocNode, pos, lines);

        typesToCheck.forEach(function (type) {
            if (type.expectedType && type.expectedType !== type.currentType) {
                context.report(
                    jsdocNode,
                    {
                        line: pos.line,
                        column: pos.column
                    },
                    'Use "{{expectedType}}" instead of "{{currentType}}".baidu044',
                    {
                        currentType: type.currentType,
                        expectedType: type.expectedType
                    }
                );
            }
        });
    }


    /**
     * Check basic syntax of jsdoc3
     *
     * @param {ASTNode} node current nonde
     * @param {ASTNode} jsdocNode jsdoc node of current node
     * @param {Object} jsdoc node parsed by doctrine
     * @param {string[]} lines source code lines of jsdocNode
     * @param {number} startLine the start line of jsdocNode
     * @param {number} startColumn the start column of jsdocNode
     * @return {Object} params object
     */
    function checkBasicSyntax(node, jsdocNode, jsdoc, lines, startLine, startColumn) {
        var hasReturns;
        var hasConstructor;
        var hasAbstract;
        var hasOverride;
        var isInterface;
        var disallowReturn;
        var functionData = fns.pop();
        var params = Object.create(null);

        jsdoc.tags.forEach(function (tag) {

            var pos = {line: startLine + tag.lineNumber, column: startColumn};

            switch (tag.title.toLowerCase()) {

                case 'param':
                case 'arg':
                case 'argument':
                    if (!tag.type) {
                        context.report(
                            jsdocNode,
                            pos,
                            'Missing JSDoc parameter type for "{{name}}".baidu052',
                            {name: tag.name}
                        );
                    }

                    if (!tag.description && requireParamDescription) {
                        context.report(
                            jsdocNode,
                            pos,
                            'Missing JSDoc parameter description for "{{name}}".baidu053',
                            {name: tag.name}
                        );
                    }

                    if (params[tag.name]) {
                        context.report(
                            jsdocNode,
                            pos,
                            'Duplicate JSDoc parameter "{{name}}".baidu998',
                            {name: tag.name}
                        );
                    }


                    if (~tag.name.indexOf('.')) {
                        var namespaces = tag.name.split('.');
                        var firstName = namespaces.shift();

                        params[firstName] = params[firstName] || {};
                        params[firstName].keys = params[firstName].keys || {};
                        params[firstName].keys[namespaces.join('.')] = tag;
                    }
                    else {
                        params[tag.name] = tag;
                    }

                    break;

                case 'return':
                case 'returns':
                    hasReturns = true;

                    if (!requireReturn
                        && !functionData.returnPresent
                        && (tag.type == null || !isValidReturnType(tag))
                    ) {
                        if (hasAbstract
                            || jsdoc.tags.some(function (tag) {
                                return tag.title === 'abstract';
                            })
                            || node.async
                            || node.generator
                        ) {
                            break;
                        }
                        disallowReturn = true;
                        context.report(
                            jsdocNode,
                            pos,
                            'Unexpected @' + tag.title + ' tag; function has no return statement.baidu998'
                        );
                    }
                    else {
                        if (requireReturnType && !tag.type) {
                            context.report(
                                jsdocNode,
                                pos,
                                'Missing JSDoc return type.baidu053'
                            );
                        }

                        if (requireReturnDescription && !tag.description && !isValidReturnType(tag)) {
                            context.report(
                                jsdocNode,
                                pos,
                                'Missing JSDoc return description.baidu053'
                            );
                        }
                    }

                    break;

                case 'constructor':
                case 'class':
                    hasConstructor = true;
                    break;

                case 'abstract':
                    hasAbstract = true;
                    break;

                case 'override':
                case 'inheritdoc':
                    hasOverride = true;
                    break;

                case 'interface':
                    isInterface = true;
                    break;

                // no default
            }

            // check tag preferences
            if (
                prefer.hasOwnProperty(tag.title)
                && tag.title !== prefer[tag.title]
                && (!disallowReturn || disallowReturn && !/^returns?$/i.test(tag.title))
            ) {
                context.report(
                    jsdocNode,
                    pos,
                    'Use @{{name}} instead.baidu' + (tag.title === 'constructor' ? '048' : '998'),
                    {name: prefer[tag.title]}
                );
            }

            // validate the types
            if (checkPreferType) {
                validateTagType(tag, jsdocNode, pos, lines);
            }

        });

        if (jsdoc.tags.length) {
            if (options.requireDescription && !jsdoc.description) {
                if (!hasOverride) {
                    context.report(
                        jsdocNode,
                        {line: startLine + 1, column: startColumn},
                        'Missing JSDoc description.baidu052'
                    );
                }
            }
            else if (requireBlankLineAfterDescription && !/^\s+\*\s*$/.test(lines[jsdoc.tags[0].lineNumber - 1])) {
                context.report(
                    jsdocNode,
                    {line: startLine + jsdoc.tags[0].lineNumber, column: startColumn},
                    'Expected a blank comment line between description and tags.baidu997'
                );
            }
        }

        // check for functions missing @return
        if (
            !hasOverride && !hasReturns && !hasConstructor && !isInterface
            && node.parent.kind !== 'get' && node.parent.kind !== 'constructor'
            && node.parent.kind !== 'set' && !isTypeClass(node)
        ) {
            if (requireReturn || functionData.returnPresent) {
                context.report(
                    jsdocNode,
                    'Missing JSDoc @' + (prefer.returns || 'returns') + ' for function.baidu052'
                );
            }
        }


        // check the parameters
        var jsdocParams = Object.keys(params);
        var paramIndex = 0;
        var checkParams = function (param, name, parentName) {
            var jsdocParam = jsdocParams[paramIndex];
            var tag  = params[jsdocParam];

            if (jsdocParam === name) {
            }
            else if (tag && parentName) {
                tag = tag.keys && tag.keys[parentName + '.' + name];
            }
            else if (tag && tag.keys) {
                tag = tag.keys[name];
            }

            if (
                tag
                && name
                && (tag.name && name !== tag.name.replace(/^.+\.(?=[^\.]+)/, ''))
            ) {
                var row = params[jsdocParam].lineNumber;
                var col = (lines[row] + '').indexOf(jsdocParam);

                context.report(
                    jsdocNode,
                    {line: startLine + row, column: col},
                    'Expected JSDoc for "{{name}}" but found "{{jsdocName}}".baidu052',
                    {
                        name: name,
                        jsdocName: jsdocParam
                    }
                );
            }
            else if (!hasOverride && name && !tag) {
                context.report(
                    jsdocNode,
                    {line: startLine + 1, column: startColumn},
                    'Missing JSDoc for parameter "{{name}}".baidu052',
                    {name: name}
                );
            }

            if (params[name]) {
                paramIndex++;
            }
        };

        var isArrayOrObjectPattern = function (type) {
            return type === 'ArrayPattern' || type === 'ObjectPattern';
        };

        var namespace = [];
        node.params && node.params.forEach(function check(param) {
            var type = param.type;
            var name = getParamName(param, params);
            if (isArrayOrObjectPattern(type)) {
                (param.elements || param.properties).forEach(check);
            }
            else if (type === 'Property' && isArrayOrObjectPattern(param.value.type)) {
                if (options.requireObjectPatternParamBranchName) {
                    check(param.key);
                }

                namespace.push(getParamName(param.key));
                check(param.value);
                namespace.pop();
            }
            else {
                checkParams(param, name, namespace.join('.'));
            }
        });

        return params;
    }

    /**
     * Validate the JSDoc node and output warnings if anything is wrong.
     *
     * @param {ASTNode} node The AST node to check.
     * @return {void}
     * @private
     */
    function checkJSDoc(node) {
        var jsdocNode = context.getJSDocComment(node);

        // make sure only to validate JSDoc comments
        if (jsdocNode) {
            var jsdoc = parseDoc(jsdocNode);

            if (!jsdoc) {
                return;
            }

            var startLine = jsdocNode.loc.start.line;
            var startColumn = jsdocNode.loc.start.column + 1;
            var lines = jsdocNode.value.split(/\r?\n/);

            if (startLine > 1) {
                var codeBeforeLine = context.getSourceLines()[startLine - 2];
                if (
                    requireEmptyLineBeforeComment
                    && !/^\s*(\/[\/\*].*)?$/.test(codeBeforeLine) && !/\*\/\s*$/.test(codeBeforeLine)
                ) {
                    context.report(jsdocNode, 'Expected an empty line before JSDoc comment.baidu041');
                }
            }

            if (options.matchDescription) {
                var regex = new RegExp(options.matchDescription);

                if (!regex.test(jsdoc.description)) {
                    context.report(
                        jsdocNode,
                        'JSDoc description does not satisfy the regex pattern({{regex}}).baidu997',
                        {regex: regex.toString()}
                    );
                }
            }

            var params = checkBasicSyntax(node, jsdocNode, jsdoc, lines, startLine, startColumn);
            var jsdocParams = Object.keys(params);

            var key = jsdocParams[jsdocParams.length - 1];
            var docParam = params[key];

            if (!key || !docParam) {
                return;
            }

            if (docParam.type == null || !node.params) {
                return;
            }

            var param = node.params[node.params.length - 1];
            if (!param || param.type !== 'RestElement') {
                return;
            }

            var paramType = docParam.type.name || docParam.type.type;
            if (paramType !== 'RestType') {
                context.report(
                    jsdocNode,
                    {line: startLine + docParam.lineNumber, column: startColumn},
                    'Expected a rest type({...<Type>}) for rest parameter "{{name}}".baidu044',
                    {name: key}
                );
            }

        }
        else {
            fns.pop();
        }

    }

    /**
     * 匹配各种 linter 和 istanbul 的注释
     *
     * @const
     * @type {RegExp}
     */
    var IGNORE_PATTERN = /^\s*(?=eslint|istanbul|jshint|jslint|jscs|globals?)/;

    /**
     * 匹配以 / 开始和结束的字符串
     *
     * @const
     * @type {RegExp}
     */
    var REGEX_PATTERN = /^\/.*\/$/;

    /**
     * 匹配 jsdoc 的开始标记
     *
     * @const
     * @type {RegExp}
     */
    var JSDOC_OPEN_PATTERN = /^\*\s*/;

    var ignored = options.ignore || [];

    if (!Array.isArray(ignored)) {
        ignored = [ignored];
    }

    function isIgnored(value) {
        return ignored.some(function (item) {
            return REGEX_PATTERN.test(item)
                ? new RegExp(item.slice(1, -1)).test(value)
                : item === value;
        });
    }

    function checkBlockComments(node) {
        node.comments.forEach(function (comment) {
            // comment.type === 'Line'
            if (comment.type !== 'Block') {
                return;
            }

            var value = comment.value;

            // JSDoc open tag
            if (value.match(JSDOC_OPEN_PATTERN)) {
                return;
            }

            // commands of Linter & istanbul
            if (value.match(IGNORE_PATTERN)) {
                return;
            }

            // ignore by configuration
            if (isIgnored(value)) {
                return;
            }


            var jsdoc = parseDoc(comment);
            if (jsdoc && jsdoc.tags.length) {
                context.report(comment, 'JSDoc opent tag should be `/**`, not `/*`.baidu040');
            }
            else if (preferLineComment) {
                context.report(comment, 'Expected to use LineComment but saw BlockComment.baidu039');
            }
        });
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        'Program': checkFile,
        'ArrowFunctionExpression': startFunction,
        'FunctionExpression': startFunction,
        'FunctionDeclaration': startFunction,
        'ClassExpression': startFunction,
        'ClassDeclaration': startFunction,
        'ArrowFunctionExpression:exit': checkJSDoc,
        'FunctionExpression:exit': checkJSDoc,
        'FunctionDeclaration:exit': checkJSDoc,
        'ClassExpression:exit': checkJSDoc,
        'ClassDeclaration:exit': checkJSDoc,
        'ReturnStatement': addReturn,
        'Program:exit': function (node) {
            checkBlockComments(node);
            cachedJSDocNodes = {};
            fns.length = 0;
        }
    };

};


module.exports.schema = [
    {
        type: 'object',
        properties: {
            ignore: {
                oneOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                ]
            },
            prefer: {
                type: 'object',
                additionalProperties: {
                    type: 'string'
                }
            },
            preferType: {
                type: 'object',
                additionalProperties: {
                    type: 'string'
                }
            },
            preferLineComment: {
                type: 'boolean'
            },
            requireReturn: {
                type: 'boolean'
            },
            requireAuthor: {
                type: 'boolean'
            },
            requireDescription: {
                type: 'boolean'
            },
            requireFileDescription: {
                type: 'boolean'
            },
            requireParamDescription: {
                type: 'boolean'
            },
            requireReturnType: {
                type: 'boolean'
            },
            requireReturnDescription: {
                type: 'boolean'
            },
            requireBlankLineAfterDescription: {
                type: 'boolean'
            },
            requireEmptyLineBeforeComment: {
                type: 'boolean'
            },
            requireObjectPatternParamBranchName: {
                type: 'boolean'
            },
            matchDescription: {
                type: 'string'
            }
        },
        additionalProperties: false
    }
];
