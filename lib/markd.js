/**
 * @file markdown tag and filter
 * @author chris<wfsr@foxmail.com>
 */

var marked = require('marked');
var highlight = require('highlight.js');

marked.setOptions({
    highlight: function (code) {
        return highlight.highlight('javascript', code).value;
    }
});

module.exports = function (options) {
    options = options || {};

    options.filters = options.filters || {};
    options.filters.marked = (function () {
        var filter = function (str) {
            return marked(str);
        };

        filter.safe = true;

        return filter;
    })();

    options.extensions = options.extensions || {};
    options.extensions.marked = marked;

    options.tags = options.tags || {};
    options.tags.marked = {
        parse: function (str, line, parser, types, options) {
            parser.on('*', function () {
                throw new Error('The marked tag does not accept arguments');
            });

            return true;
        },

        compile: function (compiler, args, content, parents, options, blockName) {
            return ''
                + '(function () {\n'
                + '  var __o = _output;\n'
                + '  _output = "";\n'
                + compiler(content, parents, options, blockName) + ';\n'
                + '  __o += _ext.marked(_output.trim());\n'
                + '  _output = __o;\n'
                + '})();\n';
        },

        ends: true,

        blockLevel: false,

        safe: true
    };

    return options;
};
