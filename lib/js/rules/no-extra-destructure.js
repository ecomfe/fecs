/**
 * @file Rule to check if exists unnecessary destructure.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'Disallow to use unnecessary destructure',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: []
    },

    create: function (context) {

        function report(node) {
            context.report(node, 'Unnecessary destructure.');
        }

        function isLiteral(node) {
            return node && node.type === 'Literal';
        }

        function hasSameStructure(left, right) {
            return left === 'ObjectPattern' && right === 'ObjectExpression'
                || left === 'ArrayPattern' && right === 'ArrayExpression';
        }

        function isSameIdentifier(left, right) {
            return left.type === 'Identifier'
                && right.type === 'Identifier'
                && left.name === right.name;
        }

        function validate(left, right) {
            if (!left || !right || !hasSameStructure(left.type, right.type)) {
                return;
            }

            if (left.elements) {
                left.elements.forEach(function (el, i) {
                    var rightElement = right.elements[i];
                    if (!el || !rightElement) {
                        return;
                    }

                    if (isLiteral(rightElement) || isSameIdentifier(el, rightElement)) {
                        report(el);
                    }
                    else {
                        validate(el, rightElement);
                    }
                });
            }
            else {
                var map = right.properties.reduce(function (map, property) {
                    if (!property.key) {
                        return map;
                    }

                    if (isLiteral(property.key) || isLiteral(property.value)) {
                        report(property);
                    }
                    else {
                        map[property.key.name] = true;
                    }

                    return map;
                }, {});

                left.properties.forEach(function (property, i) {
                    if (!property.key) {
                        return;
                    }

                    if (property.key.type === 'Identifier' && map[property.key.name]) {
                        report(property);
                    }
                    else {
                        validate(property, right.properties[i]);
                    }
                });
            }
        }

        return {
            VariableDeclarator: function (node) {
                validate(node.id, node.init);
            },

            AssignmentExpression: function (node) {
                validate(node.left, node.right);
            }
        };
    }
};
