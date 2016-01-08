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
    var PROMISE_TYPE = 'Promise.<resolveType, rejectType>';

    // these both default to true, so you have to explicitly make them false
    var requireReturn = options.requireReturn !== false;
    var requireReturnDescription = !!options.requireReturnDescription !== false;
    var requireParamDescription = options.requireParamDescription !== false;

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    // Using a stack to store if a function returns or not (handling nested functions)
    var fns = [];

    /**
     * When parsing a new function, store it in our function stack.
     *
     * @param {ASTNode} node current node.
     * @private
     */
    function startFunction(node) {
        fns.push({
            returnPresent: (node.type === 'ArrowFunctionExpression' && node.body.type !== 'BlockStatement')
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
        return tag.type.name === 'void' || tag.type.type === 'UndefinedLiteral';
    }

    /**
     * Use doctrine to parse comment node.
     *
     * @param {ASTNode} commentNode comment node from AST
     * @return {?doctrine.tag}
     * @private
     */
    function parseDoc(commentNode) {
        try {
            return doctrine.parse(
                commentNode.value,
                {
                    strict: true,
                    unwrap: true,
                    sloppy: true,
                    lineNumbers: true,
                    recoverable: true
                }
            );
        }
        catch (ex) {
            if (typeof ex.line !== 'number') {
                throw ex;
            }

            var line = commentNode.loc.start.line + ex.line;
            var column = ex.column;

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

            return null;
        }
    }

    var PRIMITIVE_TYPES_EXCEPT_OBJECT = /^(number|boolean|string|Date|RegExp|Function|Null|Undefined|Array)$/;

    /**
     * Get the name of param node
     *
     * @param {ASTNode} node the param node
     * @param {doctrine.tag} docNode the jsdoc node for this param
     * @return {string}
     */
    function getParamName(node, docNode) {
        var type = node.type;

        switch (type) {
            case 'Identifier':
                return node.name;

            case 'RestElement':
                return node.argument.name;

            case 'AssignmentPattern':
                return node.left.name;

            case 'ArrayPattern':
                return docNode && docNode.type.name === 'Array' ? docNode.name : '';

            case 'ObjectPattern':
                return docNode && !PRIMITIVE_TYPES_EXCEPT_OBJECT.test(docNode.type.name) ? docNode.name : '';

            default:
                return '';
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
        var fileCommentNode = node.comments.filter(
            function (comment) {
                return comment.type === 'Block' && comment.value[0] === '*';
            }
        )[0];

        var hasFile;
        var hasAuthor;
        if (fileCommentNode) {
            var jsdoc = parseDoc(fileCommentNode);

            if (!jsdoc) {
                return;
            }

            jsdoc.tags.forEach(function (tag) {
                switch (tag.title) {
                    case 'file':
                    case 'fileoverview':
                        hasFile = true;
                        break;
                    case 'author':
                        hasAuthor = true;
                        break;
                }

                if (prefer.hasOwnProperty(tag.title)) {
                    var code = prefer[tag.title] === 'file' ? '045' : '998';
                    context.report(
                        fileCommentNode,
                        'Use @{{name}} instead.baidu' + code,
                        {name: prefer[tag.title]}
                    );
                }

            });
        }

        if (!hasFile) {
            context.report(
                fileCommentNode || node,
                {line: 1, column: 0},
                'Missing JSDoc @file.baidu045'
            );
        }

        if (!hasAuthor) {
            context.report(
                fileCommentNode || node,
                {line: 1, column: 0},
                'Missing JSDoc @author.baidu046'
            );
        }
    }

    /**
     * check type in @param or @return
     *
     * @param {(module:doctrine.Type | Object)} type type of tag
     * @param {ASTNode} node jsdoc comment node
     * @param {Object} pos position of current tag
     * @param {module:doctrine.Tag} tag current tag
     * @param {string[]} lines comment node source lines
     * @private
     */
    function checkType(type, node, pos, tag, lines) {
        var raw = (lines[tag.lineNumber] || '');
        var name;

        if (type.type === 'ArrayType') {
            name = (type.elements[0] || {}).name || 'type';
            context.report(
                node,
                {
                    line: pos.line,
                    column: raw.indexOf('[' + name + ']')
                },
                'Expected "Array.<{{name}}>" or "{{name}}[]" but "[{{name}}]" found.baidu043',
                {name: name}
            );
        }

        if (
            type.type === 'TypeApplication'
            && type.expression
            && type.expression.name.toLowerCase() === 'promise'
        ) {
            name = type.expression.name;
            if (name !== 'Promise') {
                context.report(
                    node,
                    {
                        line: pos.line,
                        column: 1 + raw.indexOf('{' + name)
                    },
                    'Expected JSDoc type name "{{name}}" but "{{jsdocName}}" found.baidu044',
                    {
                        name: 'Promise',
                        jsdocName: name
                    }
                );
            }

            if (type.applications.length !== 2) {
                var column = 1 + raw.indexOf('{' + name);
                context.report(
                    node,
                    {
                        line: pos.line,
                        column: column
                    },
                    'Expected JSDoc type name "{{name}}" but "{{jsdocName}}" found.baidu044',
                    {
                        name: PROMISE_TYPE,
                        jsdocName: raw.substring(column, raw.indexOf('}', column))
                    }
                );
            }
        }

        var elements = type.applications || (type.expression || type).elements;
        if (!type.name && elements) {
            elements.forEach(function (type) {
                checkType(type, node, pos, tag, lines);
            });
            return;
        }

        if (type.name && type.type === 'NameExpression') {
            var map = {
                'string': 'string',
                'boolean': 'boolean',
                'number': 'number',
                'int': 'number',
                'array': 'Array',
                'function': 'Function',
                'date': 'Date',
                'object': 'Object',
                'regexp': 'RegExp',
                'promise': PROMISE_TYPE,
                'Promise': PROMISE_TYPE
            };
            var preferName = map[type.name.toLowerCase()];

            if (preferName && type.name !== preferName) {
                context.report(
                    node,
                    {
                        line: pos.line,
                        column: 1 + raw.indexOf('{' + type.name + '}')
                    },
                    'Expected JSDoc type name "{{name}}" but "{{jsdocName}}" found.baidu044',
                    {
                        name: preferName,
                        jsdocName: type.name
                    }
                );
            }
        }
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
        var functionData = fns.pop();
        var params = Object.create(null);

        jsdoc.tags.forEach(function (tag) {

            var pos = {line: startLine + tag.lineNumber, column: startColumn};

            switch (tag.title) {

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

                    if (!tag.name) {
                        context.report(
                            jsdocNode,
                            pos,
                            'Missing JSDoc parameter name.baidu053'
                        );
                    }
                    else if (params[tag.name]) {
                        context.report(
                            jsdocNode,
                            pos,
                            'Duplicate JSDoc parameter "{{name}}".baidu998',
                            {name: tag.name}
                        );
                    }
                    else if (tag.name.indexOf('.') === -1) {
                        params[tag.name] = tag;
                    }
                    break;

                case 'return':
                case 'returns':
                    hasReturns = true;

                    if (!requireReturn
                        && !functionData.returnPresent
                        && tag.type.name !== 'void'
                        && tag.type.name !== 'undefined'
                    ) {
                        if (hasAbstract
                            || jsdoc.tags.some(function (tag) {
                                return tag.title === 'abstract';
                            })
                            || node.async
                            || node.generator && !('async' in node)
                        ) {
                            break;
                        }

                        context.report(
                            jsdocNode,
                            pos,
                            'Unexpected @' + tag.title + ' tag; function has no return statement.baidu998'
                        );
                    }
                    else {
                        if (!tag.type) {
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

                // no default
            }

            // check tag preferences
            if (prefer.hasOwnProperty(tag.title) && tag.title !== prefer[tag.title]) {
                context.report(
                    jsdocNode,
                    pos,
                    'Use @{{name}} instead.baidu' + (tag.title === 'constructor' ? '048' : '998'),
                    {name: prefer[tag.title]}
                );
            }

            var type = tag.type;
            if (type) {
                checkType(type, jsdocNode, pos, tag, lines);
            }


        });

        if (jsdoc.tags.length) {
            if (!jsdoc.description) {
                if (!hasOverride) {
                    context.report(
                        jsdocNode,
                        {line: startLine + 1, column: startColumn},
                        'Missing JSDoc description.baidu052'
                    );
                }
            }
            else if (!/^\s+\*\s*$/.test(lines[jsdoc.tags[0].lineNumber - 1])) {
                context.report(
                    jsdocNode,
                    {line: startLine + jsdoc.tags[0].lineNumber, column: startColumn},
                    'Expected a blank comment line between description and tags.baidu997'
                );
            }
        }

        // check for functions missing @return
        if (!hasOverride && !hasReturns && !hasConstructor && node.parent.kind !== 'get') {
            if (requireReturn || functionData.returnPresent) {
                context.report(
                    jsdocNode,
                    'Missing JSDoc @return for function.baidu052'
                );
            }
        }


        // check the parameters
        var jsdocParams = Object.keys(params);

        node.params.forEach(function (param, i) {
            var name = getParamName(param, params[jsdocParams[i]]);

            if (jsdocParams[i] && (name !== jsdocParams[i])) {
                var row = params[jsdocParams[i]].lineNumber;
                var col = (lines[row] || '').indexOf(jsdocParams[i]);

                context.report(
                    jsdocNode,
                    {line: startLine + row, column: col},
                    'Expected JSDoc for "{{name}}" but found "{{jsdocName}}".baidu052',
                    {
                        name: name || param.type,
                        jsdocName: jsdocParams[i]
                    }
                );
            }
            else if (!hasOverride && !params[name]) {
                context.report(
                    jsdocNode,
                    'Missing JSDoc for parameter "{{name}}".baidu052',
                    {name: name}
                );
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

            if (startLine > 2) {
                var codeBeforeLine = context.getSourceLines()[startLine - 2];
                if (!/^\s*(\/[\/\*].*)?$/.test(codeBeforeLine) && !/\*\/\s*$/.test(codeBeforeLine)) {
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

            if (docParam.type == null) {
                return;
            }

            var param = node.params[node.params.length - 1];
            if (!param || param.type !== 'RestElement') {
                return;
            }

            var paramType = docParam.type.name || docParam.type.type;
            if (paramType === 'OptionalType') {
                paramType = docParam.type.expression.type;
            }

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

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        'Program': checkFile,
        'ArrowFunctionExpression': startFunction,
        'FunctionExpression': startFunction,
        'FunctionDeclaration': startFunction,
        'ArrowFunctionExpression:exit': checkJSDoc,
        'FunctionExpression:exit': checkJSDoc,
        'FunctionDeclaration:exit': checkJSDoc,
        'ReturnStatement': addReturn
    };

};


module.exports.schema = [
    {
        type: 'object',
        properties: {
            prefer: {
                type: 'object',
                additionalProperties: {
                    type: 'string'
                }
            },
            requireReturn: {
                type: 'boolean'
            },
            requireParamDescription: {
                type: 'boolean'
            },
            requireReturnDescription: {
                type: 'boolean'
            },
            matchDescription: {
                type: 'string'
            }
        },
        additionalProperties: false
    }
];
