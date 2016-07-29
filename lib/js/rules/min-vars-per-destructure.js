/**
 * @file Rule to check variables declared during destructuring.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'enforce a minimum variables declared during destructuring',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: [
            {
                type: 'integer',
                minimum: 0
            }
        ]
    },

    create: function (context) {
        var min = (context.options[0] | 0) || 2;

        function isDestructure(node) {
            return node.type === 'ObjectPattern' || node.type === 'ArrayPattern';
        }

        /**
         * Check destructure variables count
         *
         * @param {ASTNode} node The VariableDeclarator node.
         */
        function validate(node) {
            var id = node.id;
            if (!id || !isDestructure(id)) {
                return;
            }

            var count = (id.properties || id.elements).reduce(function count(total, property) {
                if (!property) {
                    return total;
                }

                var node = (property.value || property);

                switch (node.type) {
                    case 'AssignmentPattern':
                        total++;

                    case 'RestElement':
                    case 'Identifier':
                    case 'RestProperty':
                    case 'ExperimentalRestProperty':
                        total++;
                        break;

                    case 'ArrayPattern':
                        total += node.elements.reduce(count, 0);
                        break;

                    case 'ObjectPattern':
                        total += node.properties.reduce(count, 0);
                        break;
                }

                return total;
            }, 0);


            if (count < min) {
                context.report(
                    node,
                    'Not enough variables declared during destructuring ({{count}}). Minimum allowed is {{min}}.',
                    {count: count, min: min}
                );
            }
        }

        return {
            VariableDeclarator: validate
        };
    }
};
