/**
 * @file Rule to flag use of arguments
 * @author chris<wfsr@foxmail.com>
 */

'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {
    var options = context.options[0] || {};

    /**
     * Check SpreadProperty Node
     *
     * @param {Property} property property node
     * @return {boolean} [return description]
     */
    function isSpreadProperty(property) {
        return property.type === 'SpreadProperty'
            || property.type === 'SpreadElement'
            || property.type === 'ExperimentalSpreadProperty'
            || property._babelType === 'SpreadProperty';
    }

    return {

        ObjectExpression: function (node) {
            var result = node.properties.reduce(function (result, property) {
                if (options.spread && isSpreadProperty(property)
                    || options.method && property.method
                    || options.computed && property.computed
                    || options.set && property.kind === 'set'
                    || options.get && property.kind === 'get'
                ) {
                    result.ignored++;
                }
                else if (property.shorthand) {
                    result.shorthand++;
                }
                else if (!isSpreadProperty(property)
                    && property.key.type === 'Identifier'
                    && property.value.type === 'Identifier'
                    && property.key.name === property.value.name
                ) {
                    result.invalid.push(property);
                }

                return result;
            }, {shorthand: 0, ignored: 0, invalid: []});

            if (result.shorthand + result.ignored + result.invalid.length === node.properties.length) {
                result.invalid.forEach(function (property) {
                    context.report(property, 'Expected shorthand for `{{name}}`.', {name: property.key.name});
                });
            }
        }
    };

};

module.exports.schema = [
    {
        type: 'object',
        properties: {
            spread: {
                type: 'boolean'
            },
            get: {
                type: 'boolean'
            },
            set: {
                type: 'boolean'
            },
            computed: {
                type: 'boolean'
            },
            method: {
                type: 'boolean'
            }
        }
    }
];
