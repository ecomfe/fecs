/**
 * @file 检查是否有使用 eval，直接或间接
 * @author chris<wfsr.foxmail.com>
 */


module.exports = function (context) {
    'use strict';

    function check(node) {
        var callee = node.callee;
        if (callee.name === 'eval'
            || callee.type === 'MemberExpression'
            && callee.object.name === 'window'
            && callee.property.name === 'eval'
        ) {
            context.report(node, 'Avoid to use eval or window.eval.');
        }
    }

    return {
        CallExpression: check
    };

};

module.exports.schema = [];
