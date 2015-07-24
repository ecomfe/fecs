/**
 * @file XML formatter for check results
 * @author leeight<leeight@gmail.com>
 */

function escape(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&apos;');
}

module.exports = function (json) {

    var header = ''
        + '<?xml version="1.0" encoding="utf-8"?>'
        + '<checkstyle version="4.3">';


    var footer = ''
        + '</checkstyle>';

    var body = [];
    json.forEach(function (file) {
        var div = ['<file name="' + file.path + '" count="' + file.errors.length + '">'];

        file.errors.forEach(function (error) {
            div.push('<error');
            div.push(' line="' + error.line + '"');
            div.push(' column="' + error.column + '"');
            div.push(' severity="error"');
            div.push(' source="fecs"');
            div.push(' message="' + escape(error.message) + '"');
            div.push(' rule="' + error.rule + '"');
            div.push('/>');
        });

        div.push('</file>');
        body.push(div.join(''));
    });

    var html = header + body.join('') + footer;

    process.stdout.write(html);
};
