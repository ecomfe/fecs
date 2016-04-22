/**
 * @file Rule to check esnext file extension
 * @author chris<wfsr@foxmail.com>
 */

module.exports = function (context) {

    var valids = context.options[0];
    if (!Array.isArray(valids)) {
        valids = [valids];
    }

    var message = '`' + valids.join('` or `') + '`';
    var reg = new RegExp('\\.(?:' + valids.join('|') + ')$', 'i');

    return {

        Program: function (node) {
            var filepath = context.getFilename();
            if (filepath === '<input>' || /\.js$/.test(filepath)) {
                return;
            }

            if (!reg.test(filepath)) {
                context.report(
                    node,
                    {line: 1, column: 0},
                    'Expected file extension {{valid}} but found `{{name}}`.',
                    {name: filepath.split('.').pop(), valid: message}
                );
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

