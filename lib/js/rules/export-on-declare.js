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

    function isImportBindingVariable(variable) {
        return variable.references.length
            && variable.defs.length === 1
            && variable.defs[0].type === 'ImportBinding';
    }
    function isUnusedVariable(name) {
        var variables = context.getScope().variables;
        var unused = false;

        for (var i = 0, variable; variable = variables[i++];) {

            if (variable.name !== name) {
                continue;
            }

            if (variable.eslintUsed || isImportBindingVariable(variable)) {
                break;
            }

            return variable.references.length < 3;
        }

        return unused;
    }

    function check(node) {
        if (node.type === 'Identifier' && isUnusedVariable(node.name)) {
            context.report(node, MESSAGE);
        }
    }

    return {

        ExportNamedDeclaration: function (node) {
            if (!node.declaration && node.specifiers) {
                node.specifiers.forEach(function (specifier) {
                    check(specifier.local || specifier.exported);
                });
            }
        },

        ExportDefaultDeclaration: function (node) {

            switch (node.declaration.type) {
                case 'Identifier':
                    check(node.declaration);
                    break;
                case 'ArrayExpression':
                    node.declaration.elements.forEach(check);
                    break;
                case 'ObjectExpression':
                    node.declaration.properties.forEach(function (property) {
                        if (property.type === 'ExperimentalSpreadProperty') {
                            return;
                        }

                        check(property.value);
                    });
                    break;
            }
        }
    };

};

module.exports.schema = [];
