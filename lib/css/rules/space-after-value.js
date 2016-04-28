/**
 * @file csscomb rule
 * @author chris<wfsr@foxmail.com>
 */

var path = require('path');
var Module = require('module');

function createModule(filename) {
    var mod = new Module(filename);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    return mod;
}


var csscomb = createModule(Module._resolveFilename('csscomb', module.parent));
var gonzales = createModule(Module._resolveFilename('gonzales-pe', csscomb));

module.exports = {
    name: 'space-after-value',

    runBefore: 'block-indent',

    syntax: ['css', 'less', 'sass', 'scss'],

    accepts: {
        number: true,
        string: /^[ \t\n]*$/
    },

    /**
     * Processes tree node.
     *
     * @param {node} node AST node
     */
    process: function (node) {
        if (!node.is || !node.is('block')) {
            return;
        }

        var value = this.getValue(module.exports.name);

        for (var i = node.length; i--;) {
            if (!node.get(i).is('declarationDelimiter')) {
                continue;
            }

            var hasSpace = node.get(i - 1).is('space');

            if (!value && hasSpace) {
                node.remove(i - 1);
                continue;
            }

            if (value && !hasSpace) {
                var space = gonzales.createNode({type: 'space', content: value});
                node.insert(i, space);
                continue;
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {node} node AST node
     * @return {string} the config value
     */
    detect: function (node) {
        if (!node.is('block')) {
            return;
        }

        for (var i = node.length; i--;) {
            if (!node.get(i).is('declarationDelimiter')) {
                continue;
            }

            return node.get(i - 1).is('space') ? node.get(i - 1).content : '';
        }
    }
};
