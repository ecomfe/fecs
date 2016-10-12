/**
 * @file
 * @author
 */

'use strict';

let util = require('../../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'strict mode for decalar global',
            category: 'ECMAScript 5',
            recommended: true
        },

        schema: [{type: 'string'}]
    },

    create: function (context) {

        //保存的变量声明
        let defintions = [];

        let saveDefinition = node => {
            if (node.type === 'VariableDeclarator') {
                defintions.push(node.id.name);
            }
        }

        let checkDefinition = node => {
            if (node.type === 'ExpressionStatement') {
                let expressionNode = node.expression;
                while(expressionNode.left) {
                    if (expressionNode.left.type === 'Identifier' && !~defintions.indexOf(expressionNode.left.name)) {
                        context.report(node, 'declare global variable without var.');
                        break;
                    }
                    expressionNode = expressionNode.right;
                }
            }
        }
        
        return {
            'VariableDeclarator': saveDefinition,
            'ExpressionStatement': checkDefinition
        };
    }
};
