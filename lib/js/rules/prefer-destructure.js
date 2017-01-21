/**
 * @file Rule to enforce to use destructure.
 * @author chris<wfsr@foxmail.com>
 */
'use strict';


//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: 'enforce to use destructure',
            category: 'ECMAScript 6',
            recommended: false
        },

        schema: []
    },

    create: function (context) {
        var sourceCode = context.getSourceCode();

        function report(node, name, variables) {
            context.report(
                node,
                'Expected to reduce `{{variables}}` by destructuring `{{name}}`.',
                {name: name, variables: variables}
            );
        }

        function analyse(variables) {
            Object.keys(variables).forEach(function (name) {
                var variable = variables[name];

                if (variable.members.length > 1) {
                    report(
                        variable.node.identifiers[0],
                        name,
                        variable.members.map(function (member) {
                            return member.name;
                        }).join(', ')
                    );
                }

                if (variable.used || !variable.ids.length) {
                    return;
                }

                // x: ['y'], id = 'y'
                var check = function (id) {
                    var combo;
                    // y: ['temp'], refId = 'temp'
                    variables[id].ids.filter(function (refId) {
                        // temp: ['x'], cycleId = 'x'
                        return variables[refId].ids.some(function (cycleId) {
                            if (cycleId === name) {
                                // variable.used = variables[id].used = variables[refId].used = true;
                                return (combo = [variable, variables[id], variables[refId]]);
                            }
                        });
                    });

                    if (combo) {
                        combo = combo.sort(function (a, b) {
                            return a.index - b.index;
                        });

                        var node = combo.pop().node;

                        if (!node.used) {
                            node.used = true;
                            report(
                                node.identifiers[0],
                                '[' + combo[0].node.name + ', ' + combo[1].node.name + ']',
                                node.name
                            );
                        }
                    }
                };

                variable.ids.forEach(check);
            });
        }

        function fill(writeExpr, variable, variables) {
            var from;
            var expr;

            switch (writeExpr.type) {
                case 'Identifier':
                    expr = writeExpr.name;
                    from = variables[expr];
                    from && from.ids.push(variable.node.name);
                    break;

                case 'MemberExpression':
                    expr = sourceCode.getText(writeExpr);
                    if (writeExpr.object.type === 'Identifier') {
                        from = variables[writeExpr.object.name];
                        from && from.members.push({name: variable.node.name, expr: expr});
                    }
                    break;
            }
        }

        var LITERAL_TYPE_PATTERN = /^(?:Literal|ArrayExpression|ObjectExpression)$/;
        function validate(node) {
            var scope = context.getScope();
            var variables = {};
            var refs;

            if (scope.type === 'global') {
                scope = scope.childScopes[0];
                refs = scope.through.filter(function (ref, i) {
                    var id = ref.identifier;
                    var name = id.name;
                    if (ref.isRead() && !variables[name]) {
                        variables[name] = {
                            node: {
                                name: name,
                                identifiers: [id],
                                references: []
                            },
                            defs: [],
                            ids: [],
                            members: []
                        };
                    }
                    return ref.isWrite();
                });
            }

            scope.variables.forEach(function (variable, i) {
                var name = variable.name;

                if (name !== 'arguments'
                    && variable.scope.type !== 'global'
                    && (!variable.defs[0].node.id || variable.defs[0].node.id.type.slice(-7) !== 'Pattern')
                ) {
                    variables[name] = {node: variable, ids: [], members: []};
                }
            });

            refs && refs.forEach(function (ref, i) {
                var id = ref.identifier;
                var name = id.name;
                if (!ref.isRead() && ref.writeExpr && variables[name]) {
                    fill(ref.writeExpr, variables[name], variables);
                }
            });

            var IGNORE_PATTERN = /^(?=ForIn|DoWhile|While|For|ForOf|If|SwitchCase|Export)/;
            Object.keys(variables).forEach(function (name, i) {
                var variable = variables[name];
                variable.index = i;

                variable.node.references.some(function (ref) {
                    var writeExpr = ref.writeExpr;
                    if (!ref.isRead() && writeExpr && !writeExpr.type.match(LITERAL_TYPE_PATTERN)) {

                        var parent = sourceCode.getNodeByRangeIndex(ref.identifier.start - 1);
                        if (!parent
                            || IGNORE_PATTERN.test(parent.type)
                            || parent.parent && IGNORE_PATTERN.test(parent.parent.type)
                        ) {
                            return false;
                        }

                        fill(writeExpr, variable, variables);
                        return true;
                    }
                });
            });

            analyse(variables);
        }

        return {
            Program: validate,
            FunctionDeclaration: validate,
            FunctionExpression: validate,
            ArrowFunctionExpression: validate
        };
    }
};
