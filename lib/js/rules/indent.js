/**
 * @file Rule to flag use of bad indent.
 * @author Nodeca Team <https://github.com/nodeca>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = function (context) {

    var MESSAGE = 'Bad indentation ({{gotten}} instead {{needed}}).';

    var extraColumnStart = 0;
    var indentType = (context.options[0] === 'tabs') ? context.options[0] : 'spaces';
    var indentSize = +(context.options[1] || 2);
    var tabSpaces = new Array(indentSize + 1).join(' ');

    /**
     * Get node indent
     *
     * @param {ASTNode} node AST node
     * @param {boolean} byLastLine get indent of node's last line
     * @param {boolean} excludeCommas  skip comma on start of line
     * @return {number} node indents
     */
    var getNodeIndent = function (node, byLastLine, excludeCommas) {
            byLastLine = byLastLine || false;
            excludeCommas = excludeCommas || false;

            var src = context.getSource(node, node.loc.start.column + extraColumnStart);
            var lines = src.split('\n');
            if (byLastLine) {
                src = lines[lines.length - 1];
            }
            else {
                src = lines[0];
            }

            var skip = excludeCommas ? ',' : '';

            var regExp;
            var tabReg = /\t/g;
            if (indentType === 'spaces') {
                if (tabReg.test(src)) {
                    context.report(node, node.loc[byLastLine ? 'end': 'start'], 'Expect spaces but see tabs.');
                }

                regExp = new RegExp('^[ ' + skip + ']+');
                src = src.replace(tabReg, tabSpaces);
            }
            else {
                regExp = new RegExp('^[\t' + skip + ']+');
            }

            var indent = regExp.exec(src);
            return indent ? indent[0].length : 0;
        };


    /**
     *  Check indent for nodes list
     *
     * @param {Array.<ASTNode>} nodes list of node objects
     * @param {number} indent needed indent
     * @param {boolean} excludeCommas skip comma on start of line
     */
    var checkNodesIndent = function (nodes, indent, excludeCommas) {
            nodes.forEach(function (node) {
                var nodeIndent = getNodeIndent(node, false, excludeCommas);
                if (nodeIndent !== indent) {
                    context.report(node, MESSAGE, {
                        gotten: nodeIndent,
                        needed: indent
                    });
                }
            });
        };


    /**
     * Check last node line indent this detects, that block closed correctly
     *
     * @param {ASTNode} node AST node
     * @param {number} lastLineIndent needed indent
     */
    var checkLastNodeLineIndent = function (node, lastLineIndent) {
            var endIndent = getNodeIndent(node, true);
            if (endIndent !== lastLineIndent) {
                context.report(
                node, {
                    line: node.loc.end.line,
                    column: node.loc.end.column
                }, MESSAGE, {
                    gotten: endIndent,
                    needed: lastLineIndent
                });
            }
        };


    /**
     * Check indent for function block content
     * @param {ASTNode} node AST node
     */
    var checkIndentInFunctionBlock = function (node) {

            // Search first caller in chain.
            // Ex.:
            //
            // Models <- Identifier
            //   .User
            //   .find()
            //   .exec(function () {
            //   // function body
            // });
            //
            // Looks for 'Models'
            var calleeNode = node.parent; // FunctionExpression
            // while (calleeNode.parent && calleeNode.parent.type === 'CallExpression') {
            //     calleeNode = calleeNode.parent;
            // }

            var indent;

            if (~',Property,ArrayExpression,CallExpression'.indexOf(',' + calleeNode.parent.type)) {
                // If function is part of array or object, comma can be put at left
                indent = getNodeIndent(calleeNode, false, true);
            }
            else {
                // If function is standalone, simple calculate indent
                indent = getNodeIndent(calleeNode);
            }

            indent += indentSize;
            // If function content is not empty
            if (node.body.length) {
                // Calculate left shift position don't require strict indent
                // allow function body allign to (indentSize * X)
                while (getNodeIndent(node.body[0]) > indent) {
                    indent += indentSize;
                }
            }

            checkNodesIndent(node.body, indent);

            checkLastNodeLineIndent(node, indent - indentSize);
        };


    /**
     * Check indent for array block content or object block content
     * @param {ASTNode} node AST node
     */
    var checkIndentInArrayOrObjectBlock = function (node) {
            // Skip inline
            if (node.loc.start.line === node.loc.end.line) {
                return;
            }

            var elements = (node.type === 'ArrayExpression') ? node.elements : node.properties;

            // Skip if first element is in same line with this node
            if (elements.length > 0 && elements[0].loc.start.line === node.loc.start.line) {
                return;
            }

            var nodeIndent = getNodeIndent(node);

            var elementsIndent = nodeIndent + indentSize;
            // Elements can have double indent (detected by first item)
            if (elements.length > 0 && getNodeIndent(elements[0]) === elementsIndent + indentSize) {
                elementsIndent = elementsIndent + indentSize;
            }

            // Comma can be placed before property name
            checkNodesIndent(elements, elementsIndent, true);

            if (elements.length > 0) {
                // Skip last block line check if last item in same line
                if (elements[elements.length - 1].loc.end.line === node.loc.end.line) {
                    return;
                }
            }

            checkLastNodeLineIndent(node, elementsIndent - indentSize);
        };

    return {
        'Program': function (node) {
            var nodeIndent = getNodeIndent(node);

            // Root nodes should have no indent
            checkNodesIndent(node.body, nodeIndent);
        },

        'BlockStatement': function (node) {
            // Skip inline blocks
            if (node.loc.start.line === node.loc.end.line) {
                return;
            }

            if (node.parent && node.parent.type === 'FunctionExpression') {
                checkIndentInFunctionBlock(node);
                return;
            }

            var indent;

            // For this statements we should check indent from statement begin
            // (not from block begin)
            var statementsWithProperties = ['IfStatement', 'WhileStatement', 'ForStatement', 'ForInStatement'];

            if (node.parent && statementsWithProperties.indexOf(node.parent.type) !== -1) {
                indent = getNodeIndent(node.parent);
            }
            else {
                indent = getNodeIndent(node);
            }

            checkNodesIndent(node.body, indent + indentSize);

            checkLastNodeLineIndent(node, indent);
        },

        'ObjectExpression': function (node) {
            checkIndentInArrayOrObjectBlock(node);
        },

        'ArrayExpression': function (node) {
            checkIndentInArrayOrObjectBlock(node);
        },

        'SwitchStatement': function (node) {
            // Switch is not a 'BlockStatement'
            var indent = getNodeIndent(node);

            checkNodesIndent(node.cases, indent + indentSize);

            checkLastNodeLineIndent(node, indent);
        },

        'SwitchCase': function (node) {
            // Skip inline cases
            if (node.loc.start.line === node.loc.end.line) {
                return;
            }

            var indent = getNodeIndent(node);
            checkNodesIndent(node.consequent, indent + indentSize);
        }
    };
};
