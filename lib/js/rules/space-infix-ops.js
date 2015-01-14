/**
 * @file Require spaces around infix operators
 * @author Michael Ficarra
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

    var OPERATORS = [
        '*', '/', '%', '+', '-', '<<', '>>', '>>>', '<', '<=', '>', '>=', 'in',
        'instanceof', '==', '!=', '===', '!==', '&', '^', '|', '&&', '||', '=',
        '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|=',
        '?', ':', ','
    ];

    function reportNoneSpace(left, right) {
        var tokens = context.getTokensBetween(left, right, 1);
        for (var i = 1, l = tokens.length - 1, op, noLeft, noRight; i < l; ++i) {
            op = tokens[i];
            if (op.type === 'Punctuator' && OPERATORS.indexOf(op.value) >= 0) {
                noLeft = tokens[i - 1].range[1] >= op.range[0];
                noRight = op.range[1] >= tokens[i + 1].range[0];
                if (noLeft) {
                    report(op);
                }

                if (noRight) {
                    report(right);
                }

                if (noLeft || noRight) {
                    break;
                }
            }
        }
    }

    function report(node) {
        context.report(node, 'Infix operators must be spaced.');
    }

    function checkBinary(node) {
        reportNoneSpace(node.left, node.right);
    }

    function checkConditional(node) {
        reportNoneSpace(node.test, node.consequent);
        reportNoneSpace(node.consequent, node.alternate);
    }

    function checkVar(node) {
        node.init && reportNoneSpace(node.id, node.init);
    }

    return {
        AssignmentExpression: checkBinary,
        BinaryExpression: checkBinary,
        LogicalExpression: checkBinary,
        ConditionalExpression: checkConditional,
        VariableDeclarator: checkVar
    };

};
