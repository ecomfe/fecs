/**
 * @fileoverview Rule to specify spacing of object literal keys and values
 * @author Brandon Mills
 * @copyright 2014 Brandon Mills. All rights reserved.
 */
'use strict';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Gets an object literal property's key as the identifier name or string value.
 * @param {ASTNode} property Property node whose key to retrieve.
 * @return {string} The property's key.
 */
function getKey(property) {
    return property.key.name || property.key.value;
}

/**
 * Gets the number of characters in a key, including quotes around string keys.
 * @param {ASTNode} property Property of on object literal.
 * @return {number} Width of the key, including string quotes where present.
 */
function getKeyWidth(property) {
    var key = property.key;
    return (key.type === 'Identifier' ? key.name : key.raw).length;
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

var messages = {
    key: '{{error}} space after key "{{key}}".',
    value: '{{error}} space before value for key "{{key}}".'
};

module.exports = function(context) {

    /**
     * OPTIONS
     * "key-spacing": [2, {
     *     beforeColon: false,
     *     afterColon: true,
     *     align: "colon" // Optional, or "value"
     * }
     */

    var options = context.options[0] || {};
    var align = options.align;
    var beforeColon = +!!options.beforeColon; // Defaults to false
    var afterColon = +!(options.afterColon === false); // Defaults to true

    /**
     * Gets the spacing around the colon in an object literal property
     * @param {ASTNode} property Property node from an object literal
     * @return {Object} Spacing before and after the property's colon
     */
    function getPropertySpacing(property) {
        var whitespace = /^(\s*):(\s*)/.exec(context.getSource().slice(
            property.key.range[1], property.value.range[0]
        ));

        if (whitespace) {
            return {
                beforeColon: whitespace[1].length,
                afterColon: whitespace[2].length
            };
        }
    }

    /**
     * Reports an appropriately-formatted error if spacing is incorrect on one
     * side of the colon.
     * @param {ASTNode} property Key-value pair in an object literal.
     * @param {string} side Side being verified - either "key" or "value".
     * @param {number} diff Difference between actual and expected spacing.
     * @return {void}
     */
    function report(property, side, diff) {
        if (diff) {
            context.report(property[side], messages[side], {
                error: diff > 0 ? 'Extra' : 'Missing',
                key: getKey(property)
            });
        }
    }

    if (align) { // Verify vertical alignment

        return {
            ObjectExpression: function(node) {
                var properties = node.properties;
                // Width of keys, including quotes
                var widths = properties.map(getKeyWidth);
                var targetWidth = Math.max.apply(null, widths);

                // Conditionally include one space before or after colon
                targetWidth += (align === 'colon' ? beforeColon : afterColon);

                var invalids = [[], []];
                var keyValid = 0;
                var valueValid = 0;
                for (var i = 0, length = properties.length, property, spacing, width; i < length; i++) {
                    property = properties[i];
                    spacing = getPropertySpacing(property);

                    if (!spacing) {
                        continue; // Object literal getters/setters lack a colon
                    }

                    width = widths[i];

                    if (align === 'value') {
                        if (spacing.beforeColon === beforeColon) {
                            keyValid++;
                        }

                        invalids[0].push([property, 'key', spacing.beforeColon - beforeColon]);

                        if (spacing.afterColon === afterColon) {
                            valueValid++;
                        }

                        invalids[1].push([property, 'value', (width + spacing.afterColon) - targetWidth]);
                    }
                    else { // align = "colon"
                        if (spacing.beforeColon === beforeColon) {
                            keyValid++;
                        }

                        invalids[0].push([property, 'key', (width + spacing.beforeColon) - targetWidth]);

                        if (spacing.afterColon === afterColon) {
                            valueValid++;
                        }

                        invalids[1].push([property, 'value', spacing.afterColon - afterColon]);
                    }
                }

                if (keyValid !== length) {
                    invalids[0].map(function (params) {
                        report.apply(null, params);
                    });
                }

                if (valueValid !== length) {
                    invalids[1].map(function (params) {
                        report.apply(null, params);
                    });
                }
            }
        };

    }

    // Strictly obey beforeColon and afterColon in each property
    return {
        Property: function (node) {
            var spacing = getPropertySpacing(node);

            // Object literal getters/setters lack colon spacing
            if (spacing) {
                report(node, 'key', spacing.beforeColon - beforeColon);
                report(node, 'value', spacing.afterColon - afterColon);
            }
        }
    };


};
