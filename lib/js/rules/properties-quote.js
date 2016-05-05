/**
 * @file Rule to validate object properties
 * @author chris<wfsr@foxmail.com>
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    'use strict';
    var NO_QUOTES = 'Expected key `{{name}}` but `\'{{name}}\'` found.baidu094';
    var NEED_QUOTES = 'Expected key `\'{{name}}\'` but `{{name}}` found.baidu095';

    var options = context.options[0] || {};
    var ignore = options.ignore || [];

    function reducer(map, key) {
        map[key] = true;
        return map;
    }

    var ignores = (Array.isArray(ignore) ? ignore : [ignore]).reduce(reducer, Object.create(null));
    var reservedWords = [
        'abstract',
        'boolean', 'break', 'byte',
        'case', 'catch', 'char', 'class', 'const', 'continue',
        'debugger', 'default', 'delete', 'do', 'double',
        'else', 'enum', 'export', 'extends',
        'final', 'finally', 'float', 'for', 'function',
        'goto',
        'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface',
        'long',
        'native', 'new',
        'package', 'private', 'protected', 'public',
        'return',
        'short', 'static', 'super', 'switch', 'synchronized',
        'this', 'throw', 'throws', 'transient', 'try', 'typeof',
        'var', 'void', 'volatile',
        'while', 'with'
    ].reduce(reducer, Object.create(null));

    /**
     * Check SpreadProperty Node
     *
     * @param {Property} property property node
     * @return {boolean} [return description]
     */
    function isSpreadProperty(property) {
        return property.type === 'SpreadProperty'
            || property.type === 'ExperimentalSpreadProperty'
            || property._babelType === 'SpreadProperty';
    }

    function getKey(property) {
        var key = property.key;

        return isSpreadProperty(property)
            ? property.argument.name
            : (key.name || (typeof key.value === 'number' ? key.raw : key.value));
    }

    function requireQuotes(needs, key) {
        var reg = /(^\d+\D+|[^\$\w]|^0[0-7]+|^0x[a-zA-Z\d]+)/;

        if (reg.test(key) || reservedWords[key]) {
            needs.push(key);
        }
    }

    return {

        ObjectExpression: function (node) {

            var needs = [];
            var type = {literal: [], identifier: []};

            node.properties.forEach(function (property) {
                var key = getKey(property);

                if (isSpreadProperty(property)
                    || property.method
                    || property.computed
                    || property.shorthand
                    || property.kind === 'set'
                    || property.kind === 'get'
                    || ignores[key]
                ) {
                    return;
                }

                var keyType = property.key.type.toLowerCase();
                if (keyType === 'literal' && typeof property.key.value === 'number') {
                    keyType = 'identifier';
                }

                type[keyType].push(property);
                requireQuotes(needs, key);
            });

            var hadToQuote = !!needs.length;
            var message = hadToQuote ? NEED_QUOTES : NO_QUOTES;

            type[hadToQuote ? 'identifier' : 'literal'].forEach(function (property) {
                context.report(
                    property,
                    message,
                    {name: getKey(property)}
                );
            });
        }
    };

};

module.exports.schema = [
    {
        type: 'object',
        properties: {
            ignore: {
                oneOf: [
                    {
                        type: 'string'
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                ]
            }
        }
    }
];

