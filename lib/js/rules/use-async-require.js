/**
 * @file Rule to check async require.
 * @author chris<wfsr.foxmail.com>
 */

'use strict';

var util = require('../../util');

module.exports = {
    meta: {
        schema: []
    },

    create: function (context) {

        var isArray = util.isArrayNode(context);

        function validate(node) {
            if (node.callee.type !== 'Identifier' || node.callee.name !== 'require') {
                return;
            }

            var noRequire = context.getScope().through.some(function (variable) {
                return variable.identifier.name === 'require';
            });

            if (!noRequire) {
                return;
            }

            if (node.arguments.length !== 2 || !isArray(node.arguments[0])) {
                context.report(node.arguments[0], 'Global require should be called as async.');
            }
        }


        return {
            CallExpression: validate
        };
    }
};

