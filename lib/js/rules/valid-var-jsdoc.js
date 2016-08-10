/**
 * @file Rule to validate variables' name and jsdoc comment.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';

var doctrine = require('doctrine2');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        schema: []
    },

    create: function (context) {

        var sourceCode = context.getSourceCode();

        /**
         * 匹配常量命名
         *
         * @const
         * @type {RegExp}
         */
        var CONST_PATTERN = /^[A-Z]([A-Z\d$]+_?)*[A-Z\d$]$/;

        /**
         * 匹配 Pascal 命名
         *
         * @const
         * @type {RegExp}
         */
        var PASCAL_PATTERN = /^([A-Z][a-zA-Z\d$]+)+$/;

        /**
         * 匹配 Camel 命名
         *
         * @const
         * @type {RegExp}
         */
        var CAMEL_PATTERN = /^[a-z$][a-zA-Z\d$]+$/;


        /**
         * 匹配 is 或 has 开头的命名
         *
         * @const
         * @type {RegExp}
         */
        var IS_HAS_PATTERN = /^(?=is|has|IS_|HAS_)/;

        function isConstName(name) {
            return CONST_PATTERN.test(name);
        }

        function isPascalName(name) {
            return PASCAL_PATTERN.test(name);
        }

        function isCamelName(name) {
            return CAMEL_PATTERN.test(name);
        }

        function parseDoc(commentNode) {
            try {
                return doctrine.parse(
                    commentNode.value,
                    {
                        strict: true,
                        unwrap: true,
                        sloppy: true,
                        lineNumbers: true,
                        recoverable: true
                    }
                );
            }
            catch (ex) {
                return null;
            }
        }

        function getJSDoc(node) {
            var leadingComments = sourceCode.getComments(node).leading;
            var comment = leadingComments[leadingComments.length - 1];

            if (!comment
                || comment.type !== 'Block'
                || comment.value[0] !== '*'
                || node.loc.start.line - comment.loc.end.line > 1
            ) {
                return null;
            }


            return parseDoc(comment);
        }

        function checkConst(id, stat, jsdoc, node) {
            var constTag = stat.const || stat.constant;
            if (isConstName(id.name)) {
                if (stat && stat.desc && !(constTag && (constTag.type || stat.type))) {
                    context.report(
                        id,
                        'Constant variables should be tagged with description, @const and @type.baidu060'
                    );
                }
            }
            else if (constTag) {
                context.report(
                    id,
                    'Identifier `{{name}}` should be only uppercase and underscore.baidu026',
                    {name: id.name}
                );
            }
        }

        function checkBoolean(id, stat, jsdoc, node) {
            if (!IS_HAS_PATTERN.test(id.name)) {
                context.report(
                    id,
                    'Expected boolean variables with `is` or `has` prefix.baidu036'
                );
            }
        }

        function checkPascal(id, stat, jsdoc, node) {
            var init = node.init;

            // 忽略无赋值或可能为类定义的变量
            if (!init || init.type === 'FunctionExpression') {
                return;
            }

            if (isPascalName(id.name)) {
                if (init.type === 'ObjectExpression') {
                    init.properties.forEach(function (property) {
                        if (property.key && !isConstName(property.key.name)) {
                            context.report(
                                property,
                                'Property key of enum object should be named as constant variable.baidu031'
                            );
                        }
                    });
                }
            }
            else {
                context.report(id, 'Enumerable variables should be named as `Pascal`.baidu031');
            }
        }

        function validate(node) {
            var id = node.id;

            if (id.type !== 'Identifier') {
                return;
            }

            var name = id.name;
            var jsdoc = getJSDoc(node.parent);

            var stat = jsdoc && jsdoc.tags.reduce(function (stat, tag) {
                stat[tag.title] = tag;
                return stat;
            }, {desc: jsdoc && jsdoc.description}) || {};

            if (node.parent.kind === 'const' && !(stat.enum || stat.namespace)) {
                checkConst(id, stat, jsdoc, node);
            }
            else if (stat.enum || isPascalName(name) && !(stat.const || stat.namespace)) {
                checkPascal(id, stat, jsdoc, node);
            }
            else if (stat.type
                && stat.type.type
                && String(stat.type.type.name).toLowerCase() === 'boolean'
            ) {
                checkBoolean(id, stat, jsdoc, node);
            }
            else if (stat.namespace && !isCamelName(name)) {
                context.report(
                    id,
                    'Namespace should be named as `Camel`.baidu032'
                );
            }
        }

        return {
            VariableDeclarator: validate
        };
    }
};
