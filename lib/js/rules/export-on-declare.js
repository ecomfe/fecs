/**
 * @file Rule to flag use of arguments
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    var MESSAGE = 'Use `export` on declare.';

    /**
     * Determines if a given variable is being exported from a module.
     *
     * @param {Variable} variable - EScope variable object.
     * @return {boolean} True if the variable is exported, false if not.
     */
    function isExported(variable) {

        var definition = variable.defs[0];

        if (definition) {

            var node = definition.node;
            if (node.type === 'VariableDeclarator') {
                node = node.parent;
            }
            else if (definition.type === 'Parameter') {
                return false;
            }

            return node.parent.type.indexOf('Export') === 0;
        }

        return false;
    }

    /**
     * Determine if an identifier is referencing an enclosing function name.
     *
     * @param {Reference} ref - The reference to check.
     * @param {ASTNode[]} nodes - The candidate function nodes.
     * @return {boolean} True if it's a self-reference, false if not.
     */
    function isSelfReference(ref, nodes) {
        var scope = ref.from;

        while (scope) {
            if (nodes.indexOf(scope.block) >= 0) {
                return true;
            }

            scope = scope.upper;
        }

        return false;
    }

    /**
     * Determines if the variable is used.
     *
     * @param {Variable} variable - The variable to check.
     * @param {Reference[]} references - The variable references to check.
     * @return {boolean} True if the variable is used
     */
    function isUsedVariable(variable) {
        var functionNodes = variable.defs.filter(function (def) {
                return def.type === 'FunctionName';
            }).map(function (def) {
                return def.node;
            });
        var isFunctionDefinition = functionNodes.length > 0;

        return isExported(variable) || variable.references.filter(function (ref) {
            return ref.isWrite() || ref.isRead() && !(isFunctionDefinition && isSelfReference(ref, functionNodes));
        }).length > 2;
    }

    function isUnusedVariable(name, scope) {
        var variables = scope.variables;
        var unused = false;

        if (scope.type !== 'TDZ' && scope.type !== 'global') {
            for (var i = 0, variable; variable = variables[i++];) {

                if (variable.name !== name) {
                    continue;
                }
                // skip a variable of class itself name in the class scope
                if (scope.type === 'class' && scope.block.id === variable.identifiers[0]) {
                    // continue;
                }

                // skip function expression names and variables marked with markVariableAsUsed()
                if (scope.functionExpressionScope || variable.eslintUsed) {
                    continue;
                }

                // skip implicit 'arguments' variable
                if (scope.type === 'function' && variable.name === 'arguments' && variable.identifiers.length === 0) {
                    continue;
                }

                // explicit global variables don't have definitions.
                var def = variable.defs[0];
                if (def) {
                    var type = def.type;

                    if (type === 'Parameter') {

                        // skip any setter argument
                        if (def.node.parent.type === 'Property' && def.node.parent.kind === 'set') {
                            continue;
                        }

                    }

                }

                unused = !isUsedVariable(variable);
            }
        }
        return unused;
    }


    return {

        ExportNamedDeclaration: function (node) {
            if (!node.declaration) {
                context.report(node, MESSAGE);
            }
        },

        ExportDefaultDeclaration: function (node) {
            if (node.declaration
                && node.declaration.type === 'Identifier'
                && isUnusedVariable(node.declaration.name, context.getScope())
            ) {
                context.report(node, MESSAGE);
            }
        }
    };

};

module.exports.schema = [];
