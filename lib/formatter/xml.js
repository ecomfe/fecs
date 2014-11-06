/**
 * @file XML formatter for check results
 * @author chris<wfsr@foxmail.com>
 */

module.exports = function (json) {

    var header = ''
        + '<?xml version="1.0" encoding="utf-8"?>'
        + '<results>';


    var footer = ''
        + '</results>';

    var body = [];
    json.forEach(function (file) {
        var div = ['<file path="' + file.path + '" count="' + file.errors.length + '">'];

        file.errors.forEach(function (error) {
            div.push('<error');
            div.push(' line="' + error.line + '"');
            div.push(' column="' + error.column + '"');
            div.push(' rule="' + error.rule + '"');
            div.push('>');
            div.push(error.message);
            div.push('</error>');
        });

        div.push('</file>');
        body.push(div.join(''));
    });

    var html = header + body.join('') + footer;

    process.stdout.write(html);
};
