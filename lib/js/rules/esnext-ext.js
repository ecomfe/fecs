/**
 * @file Rule to check esnext file extension
 * @author chris<wfsr@foxmail.com>
 */

module.exports = function (context) {
    var MESSAGE = 'Expected file extension `{{valid}}` but found `{{ext}}`.baidu{{code}}';
    var RECOMMAND_EXT = 'js';
    var RECOMMAND_EXT_PATTERN = /\.jsx?$/;

    var valids = context.options[0];
    if (!Array.isArray(valids)) {
        valids = [valids];
    }

    var validExtensions = valids.join('` or `');

    function report(node, json) {
        context.report(
            node,
            {line: 1, column: 0},
            MESSAGE,
            json
        );
    }

    return {

        Program: function (node) {
            var filepath = context.getFilename();
            var ext = filepath.split('.').pop().toLowerCase();
            if (ext === '<input>' || ext === RECOMMAND_EXT) {
                return;
            }

            var isIgnored = valids.some(function (valid) {
                return valid === ext;
            });

            if (isIgnored && !RECOMMAND_EXT_PATTERN.test(filepath)) {
                report(node, {ext: ext, valid: RECOMMAND_EXT, code: 601});
            }

            if (!isIgnored) {
                report(node, {ext: ext, valid: validExtensions, code: 602});
            }
        }
    };

};

module.exports.schema = [
    {
        oneOf: [
            {
                type: 'string'
            },
            {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        ]
    }
];

