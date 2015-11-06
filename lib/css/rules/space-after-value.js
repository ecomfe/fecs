var gonzales = require('csscomb/node_modules/gonzales-pe');

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
     * @param {node} node
     */
    process: function(node) {
        if (!node.is('block')) return;

        var value = this.getValue('space-after-value');

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
                var space = gonzales.createNode({ type: 'space', content: value });
                node.insert(i, space);
                continue;
            }
        }
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {node} node
     */
    detect: function(node) {
        if (!node.is('declaration')) return;

        for (var i = node.length; i--;) {
            if (!node.get(i).is('declarationDelimiter')) continue;

            if (node.get(i - 1).is('space')) {
                return node.get(i - 1).content;
            } else {
                return '';
            }
        }
    }
};
