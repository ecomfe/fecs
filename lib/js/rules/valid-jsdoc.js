/**
 * @file Validates JSDoc comments are syntactically correct
 * @author Nicholas C. Zakas
 */

'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var doctrine = require('doctrine');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    var options = context.options[0] || {};
    var prefer = options.prefer || {};

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
     * @return {void}
     * @private
     */
    function startFunction() {
        fns.push({returnPresent: false});
    }

    /**
     * Indicate that return has been found in the current function.
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
                    lineNumbers: true
                }
            );
        }
        catch (ex) {

            if (/braces/i.test(ex.message)) {
                context.report(
                    commentNode,
                    'JSDoc type missing brace.baidu043'
                );
            }
            else {
                context.report(
                    commentNode,
                    'JSDoc syntax error.'
                );
            }

            return null;
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
     * Validate the JSDoc node and output warnings if anything is wrong.
     * @param {ASTNode} node The AST node to check.
     * @return {void}
     * @private
     */
    function checkJSDoc(node) {
        var jsdocNode = context.getJSDocComment(node);
        var functionData = fns.pop();
        var hasReturns = false;
        var hasConstructor = false;
        var params = Object.create(null);
        var jsdoc;
        var startLine;
        var startColumn;
        var lines;
        var hasAbstract;
        var hasOverride;

        // make sure only to validate JSDoc comments
        if (jsdocNode) {
            jsdoc = parseDoc(jsdocNode);

            if (!jsdoc) {
                return;
            }

            startLine = jsdocNode.loc.start.line;
            startColumn = jsdocNode.loc.start.column + 1;
            lines = jsdocNode.value.split(/\n/);

            jsdoc.tags.forEach(function (tag) {

                switch (tag.title) {

                    case 'param':
                        if (!tag.type) {
                            context.report(
                                jsdocNode,
                                {line: startLine + tag.lineNumber, column: startColumn},
                                'Missing JSDoc parameter type for "{{name}}".baidu052',
                                {name: tag.name}
                            );
                        }

                        if (!tag.description && requireParamDescription) {
                            context.report(
                                jsdocNode,
                                {line: startLine + tag.lineNumber, column: startColumn},
                                'Missing JSDoc parameter description for "{{name}}".baidu053',
                                {name: tag.name}
                            );
                        }

                        if (params[tag.name]) {
                            context.report(
                                jsdocNode,
                                {line: startLine + tag.lineNumber, column: startColumn},
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
                            ) {
                                break;
                            }

                            context.report(
                                jsdocNode,
                                {line: startLine + tag.lineNumber, column: startColumn},
                                'Unexpected @' + tag.title + ' tag; function has no return statement.baidu998'
                            );
                        }
                        else {
                            if (!tag.type) {
                                context.report(
                                    jsdocNode,
                                    {line: startLine + tag.lineNumber, column: startColumn},
                                    'Missing JSDoc return type.baidu053'
                                );
                            }

                            if (requireReturnDescription && tag.type.name !== 'void' && !tag.description) {
                                context.report(
                                    jsdocNode,
                                    {line: startLine + tag.lineNumber, column: startColumn},
                                    'Missing JSDoc return description.baidu053'
                                );
                            }
                        }

                        break;

                    case 'constructor':
                        hasConstructor = true;
                        break;

                    case 'abstract':
                        hasAbstract = true;
                        break;

                    case 'override':
                        hasOverride = true;
                        break;

                    // no default
                }

                // check tag preferences
                if (prefer.hasOwnProperty(tag.title)) {
                    context.report(
                        jsdocNode,
                        {line: startLine + tag.lineNumber, column: startColumn},
                        'Use @{{name}} instead.baidu998',
                        {name: prefer[tag.title]}
                    );
                }

                var type = tag.type;
                if (type) {
                    var map = {
                        'string': 'string',
                        'boolean': 'boolean',
                        'number': 'number',
                        'int': 'number',
                        'array': 'Array',
                        'function': 'Function',
                        'date': 'Date',
                        'object': 'Object',
                        'regexp': 'RegExp'
                    };
                    var preferName;

                    switch (type.type) {
                        case 'NameExpression':
                            preferName = map[type.name.toLowerCase()];
                            if (preferName && type.name !== preferName) {
                                context.report(
                                    jsdocNode,
                                    {
                                        line: startLine + tag.lineNumber,
                                        column: startColumn + lines[tag.lineNumber].indexOf(type.name)
                                    },
                                    'Expected JSDoc type name "{{name}}" but found "{{jsdocName}}".baidu044',
                                    {
                                        name: preferName,
                                        jsdocName: type.name
                                    }
                                );
                            }
                            break;
                    }
                }

            });

            // check for functions missing @return
            if (!hasOverride && !hasReturns && !hasConstructor) {
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
                var name = param.name;

                if (jsdocParams[i] && (name !== jsdocParams[i])) {
                    context.report(
                        jsdocNode,
                        {line: startLine + params[jsdocParams[i]].lineNumber, column: startColumn},
                        'Expected JSDoc for "{{name}}" but found "{{jsdocName}}".baidu052',
                        {
                            name: name,
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

        }

    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        'Program': checkFile,
        'FunctionExpression': startFunction,
        'FunctionDeclaration': startFunction,
        'FunctionExpression:exit': checkJSDoc,
        'FunctionDeclaration:exit': checkJSDoc,
        'ReturnStatement': addReturn
    };

};
