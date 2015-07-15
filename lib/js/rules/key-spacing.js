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
 *
 * @param {string} str String to test.
 * @return {boolean} True if str contains a line terminator.
 */
function containsLineTerminator(str) {
    return /[\n\r\u2028\u2029]/.test(str);
}

/**
 * Gets an object literal property's key as the identifier name or string value.
 *
 * @param {ASTNode} property Property node whose key to retrieve.
 * @return {string} The property's key.
 */
function getKey(property) {
    return property.key.name || property.key.value;
}

/**
 * Gets the number of characters in a key, including quotes around string keys.
 *
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

module.exports = function (context) {

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
     *
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
     *
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
            /* eslint-disable fecs-max-statements */
            ObjectExpression: function (node) {
                var properties = node.properties;
                // Width of keys, including quotes
                var widths = properties.map(getKeyWidth);
                var targetWidth = Math.max.apply(null, widths);

                // Conditionally include one space before or after colon
                targetWidth += (align === 'colon' ? beforeColon : (beforeColon + 1 + afterColon));

                var invalids = {before: [], after: [], alignBefore: [], alignAfter: []};
                var valids = {key: 0, value: 0, align: 0};
                var afterColonString;
                var afterColonStringWithoutLineBreak;
                for (var i = 0, length = properties.length, property, whitespace, width; i < length; i++) {
                    property = properties[i];
                    whitespace = getPropertyWhitespace(property);
                    if (!whitespace) {
                        continue;
                    }
                    afterColonString = whitespace.afterColon;
                    afterColonStringWithoutLineBreak = afterColonString.replace(/^\s*\n+/, '');

                    if (!whitespace) {
                        continue; // Object literal getters/setters lack a colon
                    }

                    width = widths[i];

                    if (align === 'value') {
                        if (whitespace.beforeColon.length !== beforeColon) {
                            invalids.before.push([property, 'key', whitespace.beforeColon, beforeColon]);
                        }

                        if (containsLineTerminator(afterColonString)) {
                            if (afterColonStringWithoutLineBreak.length === tabWidth + property.loc.start.column) {
                                valids.value++;
                                valids.align++;
                            }

                            if (property.value.loc.start.column === targetWidth + property.loc.start.column) {
                                valids.align++;
                            }

                            invalids.alignAfter.push([
                                property, 'value',
                                afterColonStringWithoutLineBreak,
                                tabWidth + property.loc.start.column
                            ]);
                            invalids.after.push([
                                property, 'value',
                                afterColonStringWithoutLineBreak,
                                tabWidth + property.loc.start.column
                            ]);
                        }
                        else {

                            if (afterColonString.length === afterColon) {
                                valids.value++;
                            }

                            if (property.value.loc.start.column === targetWidth + property.loc.start.column) {
                                valids.align++;
                            }

                            invalids.alignAfter.push([
                                property, 'value',
                                afterColonString,
                                targetWidth - (width + beforeColon + afterColon)
                            ]);
                            invalids.after.push([property, 'value', afterColonString, afterColon]);
                        }
                    }
                    else { // align = "colon"
                        if (whitespace.beforeColon.length === beforeColon) {
                            valids.key++;
                        }

                        if (targetWidth === whitespace.beforeColon.length + width) {
                            valids.align++;
                        }

                        invalids.before.push([property, 'key', whitespace.beforeColon, beforeColon]);
                        invalids.alignBefore.push([property, 'key', whitespace.beforeColon, targetWidth - width]);

                        if (containsLineTerminator(afterColonString)) {
                            if (afterColonStringWithoutLineBreak.length !== tabWidth + property.loc.start.column) {
                                invalids.after.push([
                                    property, 'value',
                                    afterColonStringWithoutLineBreak,
                                    tabWidth + property.loc.start.column
                                ]);
                            }
                        }
                        else {
                            if (afterColonString.length !== afterColon) {
                                invalids.after.push([property, 'value', afterColonString, afterColon]);
                            }
                        }
                    }
                }

                if (align === 'value') {
                    invalids.before.map(function (params) {
                        report.apply(null, params);
                    });

                    invalids[valids.value < valids.align ? 'alignAfter' : 'after'].map(function (params) {
                        report.apply(null, params);
                    });
                }
                else {
                    invalids[valids.key < valids.align ? 'alignBefore' : 'before'].map(function (params) {
                        report.apply(null, params);
                    });

                    invalids.after.map(function (params) {
                        report.apply(null, params);
                    });
                }
            }
            /* eslint-enable fecs-max-statements */
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
