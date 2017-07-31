/**
 * @file Rule to validate style of element.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

var util = require('../../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        schema: []
    },

    create: function (context) {

        var sourceCode = context.getSourceCode();

        /* eslint-disable max-len */
        var DOM_API_PATTERN = /^document\.(?:getElementById|getElementsByName|getElementsByTagName|all|querySelector|querySelectorAll)\([^\)]+\)/;
        /* eslint-enaable max-len */

        function isDom(express) {
            if (DOM_API_PATTERN.test(express)) {
                return true;
            }

            // identifier
            if (express.indexOf('.') < 0) {
                var variable;
                util.variablesInScope(context).some(function (item) {
                    if (item.name === express) {
                        variable = item;
                    }
                });

                if (!variable) {
                    return false;
                }

                var refs = variable.references;
                var i = refs.length - 1;
                var ref;
                while ((ref = refs[i--])) {
                    if (ref.isWrite()) {
                        return isDom(sourceCode.getText(ref.writeExpr));
                    }
                }
            }

            return false;
        }

        var NUM_PATTERD = /^-?(?:[1-9]|0?\.)\d*$/;
        function hasUnitRequiredNumber(num) {
            return NUM_PATTERD.test(num);
        }

        var properties = (''
            + 'flexBasis,'
            + 'borderSpacing,'
            + 'transformOrigin,'
            + 'left,right,top,bottom,clip,'
            + 'outline,outlineOffset,outlineWidth,'
            + 'columnGap,columnRule,columnRuleWidth,'
            + 'boxReflect,textStroke,textStrokeWidth'
            + 'background,backgroundPosition,backgroundSize,'
            + 'width,maxWidth,minWidth,height,maxHeight,minHeight,'
            + 'margin,marginLeft,marginRight,marginTop,marginBottom,'
            + 'padding,paddingLeft,paddingRight,paddingTop,paddingBottom,'
            + 'letterSpacing,textIdent,verticalAlign,wordSpacing,textShadow,'
            + 'border,borderShadow,borderLeft,borderRight,borderTop,borderBottom,'
            + 'borderWidth,borderLeftWidth,borderRightWidth,borderTopWidth,borderBottomWidth')
            .split(/\s*,\s*/)
            .reduce(function (map, key) {
                map[key] = true;
                return map;
            }, {});

        function validate(node) {
            var left = node.left;
            if (left.type !== 'MemberExpression'
                || left.object.type !== 'MemberExpression'
                || left.object.property.name !== 'style'
            ) {
                return;
            }

            var express = sourceCode.getText(left.object.object);
            if (!isDom(express)) {
                return;
            }

            context.report(left.object.property, 'Expected to change style via className.');

            var value = String(node.right.value)
                // 'rect(auto 5 5px auto)' -> 'auto 5 5px auto'
                .replace(/[a-z]+\(([^\),]*)\)/gi, '$1')
                // 'rgb(255,200, 0)' -> ''
                .replace(/[a-z]+\([^\)]*\)/gi, '');

            if (properties[left.property.name]
                && node.right.type === 'Literal'
                && value.split(/\s+/).some(hasUnitRequiredNumber)
            ) {
                context.report(
                    node.right,
                    'Expected to assign `{{name}}` with unit suffix value.',
                    {name: left.property.name}
                );
            }
        }

        return {
            AssignmentExpression: validate
        };
    }
};
