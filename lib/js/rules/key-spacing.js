/**
 * @file Rule to specify spacing of object literal keys and values
 * @author Brandon Mills
 * @copyright 2014 Brandon Mills. All rights reserved.
 */
'use strict';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
* Checks whether a string contains a line terminator as defined in
* http://www.ecma-international.org/ecma-262/5.1/#sec-7.3
* @param {string} str String to test.
* @return {boolean} True if str contains a line terminator.
*/
function containsLineTerminator(str) {
    return /[\n\r\u2028\u2029]/.test(str);
}

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
    var tabWidth = options.tabWidth || 4;

    /**
     * Gets the whitespace around the colon in an object literal property
     * @param {ASTNode} property Property node from an object literal
     * @return {Object} Whitespace before and after the property's colon
     */
    function getPropertyWhitespace(property) {
        var whitespace = /^(\s*):(\s*)/.exec(context.getSource().slice(
            property.key.range[1], property.value.range[0]
        ));

        if (whitespace) {
            return {
                beforeColon: whitespace[1],
                afterColon: whitespace[2]
            };
        }
    }

    /**
     * Reports an appropriately-formatted error if spacing is incorrect on one
     * side of the colon.
     * @param {ASTNode} property Key-value pair in an object literal.
     * @param {string} side Side being verified - either "key" or "value".
     * @param {string} whitespace Actual whitespace string.
     * @param {number} expected Expected whitespace length.
     * @return {void}
     */
    function report(property, side, whitespace, expected) {
        var diff = whitespace.length - expected;

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
                var afterColonString;
                var afterColonStringWithoutLineBreak;
                for (var i = 0, length = properties.length, property, whitespace, width; i < length; i++) {
                    property = properties[i];
                    whitespace = getPropertyWhitespace(property);
                    afterColonString = whitespace.afterColon;
                    afterColonStringWithoutLineBreak = afterColonString.replace(/^\n+/, '');

                    if (!whitespace) {
                        continue; // Object literal getters/setters lack a colon
                    }

                    width = widths[i];

                    if (align === 'value') {
                        if (whitespace.beforeColon.length === beforeColon) {
                            keyValid++;
                        }

                        invalids[0].push([property, 'key', whitespace.beforeColon, beforeColon]);

                        if (containsLineTerminator(afterColonString)) {
                            if (afterColonStringWithoutLineBreak.length === tabWidth + property.loc.start.column) {
                                valueValid++;
                            }

                            invalids[1].push([
                                property, 'value',
                                afterColonStringWithoutLineBreak,
                                tabWidth + property.loc.start.column
                            ]);
                        }
                        else {

                            if (afterColonString.length === afterColon) {
                                valueValid++;
                            }

                            invalids[1].push([property, 'value', afterColonString, targetWidth - width]);

                        }
                    }
                    else { // align = "colon"
                        if (whitespace.beforeColon.length === beforeColon) {
                            keyValid++;
                        }

                        invalids[0].push([property, 'key', whitespace.beforeColon, targetWidth - width]);

                        if (containsLineTerminator(afterColonString)) {
                            if (afterColonStringWithoutLineBreak.length === tabWidth + property.loc.start.column) {
                                valueValid++;
                            }

                            invalids[1].push([
                                property, 'value',
                                afterColonStringWithoutLineBreak,
                                tabWidth + property.loc.start.column
                            ]);
                        }
                        else {

                            if (afterColonString.length === afterColon) {
                                valueValid++;
                            }

                            invalids[1].push([property, 'value', afterColonString, afterColon]);

                        }
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
            var whitespace = getPropertyWhitespace(node);

            // Object literal getters/setters lack colon whitespace
            if (whitespace) {
                report(node, 'key', whitespace.beforeColon, beforeColon);
                report(node, 'value', whitespace.afterColon, afterColon);
            }
        }
    };


};
