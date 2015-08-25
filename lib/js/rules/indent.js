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
    var rootIndex = context.options[2] || 0;
    var indentType = (context.options[0] === 'tabs') ? context.options[0] : 'spaces';
    var indentSize = +(context.options[1] || 2);
    var indentSwitchCase = context.options[3] !== false;
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
                    context.report(node, node.loc[byLastLine ? 'end' : 'start'], 'Expected spaces but saw tabs.');
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
     * @param {?string=} messageSuffix string append to MESSAGE
     */
    var checkNodesIndent = function (nodes, indent, excludeCommas, messageSuffix) {
        nodes.forEach(function (node) {
            var nodeIndent = getNodeIndent(node, false, excludeCommas);
            if (nodeIndent !== indent) {
                context.report(node, MESSAGE + (messageSuffix || ''), {
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
     *
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
     *
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

    /**
     * Check indent for html strings array
     *
     * @param {ASTNode} node AST node
     * @return {boolean}
     */
    var isHTMLStrings = function (node) {
        var varNode = node.parent.parent;

        if (node.loc.start.line === node.loc.end.line) {
            return false;
        }

        var types = {};
        var startColumn = getNodeIndent(node);
        var lastColumn = startColumn;
        var lastElement;
        var messages = [];

        node.elements.forEach(function (el, i) {
            types[el.type] = (types[el.type] || 0) + 1;
            if (
                lastElement && lastElement.loc.start.line === el.loc.start.line
                || i === 0 && el.type === 'ArrayExpression' && node.loc.start.line === el.loc.start.line
            ) {
                return;
            }

            var column = el.loc.start.column;
            var needed;

            if (column <= startColumn) {
                needed = 'bigger then ' + (startColumn + indentSize);
            }
            else if (column !== lastColumn && Math.abs(column - lastColumn) !== indentSize) {
                needed = 'one of `' + [lastColumn + indentSize, lastColumn, lastColumn - indentSize] + '`';
            }

            if (needed) {
                messages.push([el, {gotten: column, needed: needed}]);
            }
            lastColumn = column > startColumn ? column : startColumn + indentSize;
            lastElement = el;
        });

        var validTypes = [
            'ArrayExpression', 'BinaryExpression',
            'CallExpression', 'ConditionalExpression',
            'Identifier', 'Literal'
        ];
        var total = 0;
        validTypes.forEach(function (name) {
            total += types[name] | 0;
        });
        var comments = varNode && varNode.leadingComments;
        if (comments && /\bhtml\b/.test(comments[0].value) || total === node.elements.length && total > 1) {

            messages.forEach(function (message) {
                context.report(message[0], MESSAGE, message[1]);
            });

            return true;
        }

        return false;
    };

    /**
     * Check whether in the same line
     *
     * @param {ASTNode} left left node
     * @param {ASTNode} right right node
     * @return {boolean}
     */
    var isSameLine = function (left, right) {
        var target = right.loc.start.line;
        return left.loc.start.line === target || left.loc.end.line === target;
    };

    return {

        Program: function (node) {
            var nodeIndent = typeof rootIndex === 'number' ? rootIndex : getNodeIndent(node);

            // Root nodes should have no indent
            checkNodesIndent(node.body, nodeIndent);
        },

        BlockStatement: function (node) {
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

        ObjectExpression: function (node) {
            checkIndentInArrayOrObjectBlock(node);
        },

        ArrayExpression: function (node) {
            if (!isHTMLStrings(node)) {
                checkIndentInArrayOrObjectBlock(node);
            }
        },

        SwitchStatement: function (node) {
            // Switch is not a 'BlockStatement'
            var indent = getNodeIndent(node);

            checkNodesIndent(node.cases, indent + (indentSwitchCase ? indentSize : 0), false, 'baidu004');

            checkLastNodeLineIndent(node, indent);
        },

        SwitchCase: function (node) {
            // Skip inline cases
            if (node.loc.start.line === node.loc.end.line) {
                return;
            }

            var indent = getNodeIndent(node);
            checkNodesIndent(node.consequent, indent + indentSize);
        },

        MemberExpression: function (node) {
            if (isSameLine(node, node.property) || isSameLine(node.object, node.property)) {
                return;
            }

            var indent = getNodeIndent(node.object);
            var propertyIndex = getNodeIndent(node.property);
            var needed;

            if (node.parent.type === 'CallExpression') {
                if (indent !== propertyIndex && propertyIndex - indent !== indentSize) {
                    needed = indent + ' or ' + (indent + indentSize);
                }
            }
            else if (propertyIndex - indent !== indentSize) {
                needed = '' + (indent + indentSize);
            }

            if (needed) {
                context.report(
                    node.property,
                    MESSAGE,
                    {
                        gotten: propertyIndex,
                        needed: needed
                    }
                );
            }
        }
    };
};
