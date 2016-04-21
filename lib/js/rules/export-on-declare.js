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

    function isUnusedVariable(name) {
        var variables = context.getScope().variables;
        var unused = false;

        for (var i = 0, variable; variable = variables[i++];) {

            // skip variables marked with markVariableAsUsed()
            if (variable.name !== name || variable.eslintUsed) {
                continue;
            }

            return variable.references.filter(function (ref) {
                return ref.isWrite() || ref.isRead();
            }).length < 3;
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
                    if (isUnusedVariable(specifier.exported.name)) {
                        context.report(specifier.exported, MESSAGE);
                    }
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
                        check(property.value);
                    });
                    break;
            }
        }
    };

};

module.exports.schema = [];
