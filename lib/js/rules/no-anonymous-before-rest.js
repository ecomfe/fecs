/**
 * @file Rule to check if exist anonymous elements before rest element.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'enforce to named elements before rest element in declarations',
            category: 'ECMAScript 6',
            recommended: true
        },

        schema: []
    },

    create: function (context) {

        return {
            RestElement: function (node) {
                var anonymous = 0;

                node.parent.elements && node.parent.elements.reduceRight(function (isBefore, element) {
                    if (!isBefore && node === element) {
                        isBefore = true;
                    }

                    if (!element && isBefore) {
                        anonymous++;
                    }

                    return isBefore;
                }, false);

                if (anonymous) {
                    context.report(
                        node.parent,
                        'No anonymous elements (found {{num}}) before rest element.',
                        {num: anonymous}
                    );
                }
            }
        };
    }
};
