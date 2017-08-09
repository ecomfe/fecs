/**
 * @file Rule to flag use of class
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

var util = require('../../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * Check whether or not name is pascal style.
 *
 * @param {string} name name to be checked
 * @return {boolean}
 */
function isPascal(name) {
    return /^([A-Z]+[a-z\d\$]*)+$/.test(name);
}

var MIN_RATE = 60;
function isReactComponent(node, item) {
    var params = node.params;
    if (!params.length || params.length > 2) {
        return false;
    }

    var rate = 0;
    var props = params[0];
    var context = params[1];

    switch (props.type) {
        case 'Identifier':
            rate += 10;
            if (props.name === 'props') {
                rate += 20;
            }
            break;
        case 'ObjectPattern':
            rate += 10;
            break;
    }

    if (context) {
        switch (context.type) {
            case 'Identifier':
                rate += 10;
                if (context.name === 'context') {
                    rate += 20;
                }
                break;
            case 'ObjectPattern':
                rate += 10;
                break;
        }
    }

    if (item.returnJSX) {
        rate += 50;
    }

    return rate >= MIN_RATE;
}

/**
 * Search a particular variable in a list (from eslint-plugin-react)
 *
 * @param {Array} variables The variables list.
 * @param {Array} name The name of the variable to search.
 * @return {nul|Variable} Variable instance if the variable was found, null if not.
 */
function findVariable(variables, name) {

    for (var i = 0, variable; variable = variables[i++];) {
        if (variable.name === name) {
            return variable;
        }
    }

    return null;
}


function isVariableWriteExpHasJSX(name, context) {
    var variables = util.variablesInScope(context);
    var variable = findVariable(variables, name);
    if (!variable) {
        return null;
    }

    return variable.references.some(function (reference) {
        return hasJSX(reference.writeExpr, context);
    });
}


function hasJSX(node, context) {
    if (!node) {
        return false;
    }

    switch (node.type) {
        case 'JSXElement':
            return true;

        case 'Identifier':
            return isVariableWriteExpHasJSX(node.name, context);

        case 'ConditionalExpression':
            return hasJSX(node.consequent, context) || hasJSX(node.alternate, context);

        case 'LogicalExpression':
            return hasJSX(node.right, context);

        default:
            return false;
    }
}

module.exports = function (context) {

    var fns = [];

    function getKey(node) {
        return node.range.join('-');
    }

    function push(name, node) {
        fns.push({
            name: name,
            type: node.type,
            returnJSX: false,
            key: getKey(node)
        });
    }

    function pop() {
        fns.pop();
    }

    function last() {
        return fns[fns.length - 1];
    }

    function isSameScope(item, node) {
        return item && item.key === getKey(node);
    }

    function validate(node) {
        var item = last();
        if (!isSameScope(item, node)) {
            return;
        }

        if (!isReactComponent(node, item)) {
            context.report(
                node,
                'Expected `class {{name}}` but found `{{type}}`.',
                {name: item.name, type: item.type}
            );
        }

        pop();
    }

    function checkFunctionExpression(node) {
        let sourceNode = node;
        while (node.parent && node.parent.type !== 'VariableDeclarator') {
            node = node.parent;
        }

        if (!node.parent || getKey(sourceNode) !== getKey(node)) {
            return;
        }

        if (node.parent.type === 'VariableDeclarator' && isPascal(node.parent.id.name)) {
            push(node.parent.id.name, node);

            if (node.type === 'ArrowFunctionExpression' && hasJSX(node.body, context)) {
                last().returnJSX = true;
            }
        }
    }

    return {

        'FunctionDeclaration': function (node) {
            if (node.id && isPascal(node.id.name)) {
                push(node.id.name, node);
            }
        },
        'FunctionExpression': checkFunctionExpression,
        'ArrowFunctionExpression': checkFunctionExpression,

        'ReturnStatement': function (node) {
            var item = last();
            if (item && !item.returnJSX && hasJSX(node.argument, context)) {
                item.returnJSX = true;
            }
        },

        'FunctionDeclaration:exit': validate,
        'FunctionExpression:exit': validate,
        'ArrowFunctionExpression:exit': validate
    };

};

module.exports.schema = [];
