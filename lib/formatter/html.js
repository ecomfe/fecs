/**
 * @file HTML formatter for check results
 * @author chris<wfsr@foxmail.com>
 */

module.exports = function (json) {

    var header = ''
        + '<!DOCTYPE html>'
        + '<html>'
        + '<head>'
        +   '<meta charset="utf-8">'
        +   '<title>fecs check results</title>'
        + '</head>'
        + '<body>'
        + '<h1>FECS Check Results</h1>';

    var footer = ''
        + '</body>'
        + '</html>';

    var body = [];
    json.forEach(function (file) {
        var div = ['<div>'];

        div.push('<h2>' + file.path + '</div>');
        div.push('<ol>');
        file.errors.forEach(function (error) {
            div.push('<li>');
            div.push('line ' + error.line + ' ');
            div.push('column ' + error.column + ': ');
            div.push(error.message);
            div.push(' (' + error.rule + ')');
            div.push('</li>');
        });

        div.push('</ol>');
        div.push('</div>');
        body.push(div.join(''));
    });

    var html = header + body.join('') + footer + '\n';

    process.stdout.write(html);
};
