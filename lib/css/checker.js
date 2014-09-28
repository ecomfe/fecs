/**
 * @file csslint checker
 * @author chris<wfsr@foxmail.com>
 */

var through = require('through2');
var CSSLint = require('csslint').CSSLint;
var RcLoader = require('rcloader');

function canHandle(path) {
    return /\.css$/.test(path);
}


module.exports = function (options) {
    var util = require('../util');

    var defaultConfig = require('./config');
    var rcloader = new RcLoader('.csslintrc', defaultConfig, {loader: util.parseJSON});
    var checked = {};

    return through.obj(
        function (file, enc, cb) {

            if (file.isStream()) {
                cb(new Error('Streaming not supported'));
                return;
            }

            if (checked[file.path] || !canHandle(file.path) || file.isNull()) {
                cb(null, file);
                return;
            }

            file.errors = [];
            checked[file.path] = true;

            var config = options.lookup
                ? rcloader.for(file.path)
                : defaultConfig;

            try {
                var result = CSSLint.verify(file.contents.toString(), config);

                result.messages.forEach(function (err) {
                    file.errors.push(err);
                });
            }
            catch (err) {
                file.errors.push({
                    line: err.line,
                    column: err.column,
                    message: err.message.replace('null:', file.relative + ':')
                });
            }

            cb(null, file);

        },
        function (cb) {
            rcloader = null;
            checked = null;
            cb();
        }
    );
};
