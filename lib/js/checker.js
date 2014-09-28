/**
 * @file jscs checker
 * @author chris<wfsr@foxmail.com>
 */

var through  = require('through2');
var Checker  = require('jscs');
var jshint   = require('jshint').JSHINT;
var RcLoader = require('rcloader');

function canHandle(path) {
    return /\.js$/.test(path);
}


module.exports = function (options) {
    var util = require('../util');

    var config = require('./config');
    var defaultJSHintConfig = config.jshint;
    var defaultJSCSConfig = config.jscs;
    var jshintRcloader = new RcLoader('.jshintrc', defaultJSHintConfig, {loader: util.parseJSON});
    var jscsRcloader = new RcLoader('.jscsrc', defaultJSCSConfig, {loader: util.parseJSON});
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

            var checker = new Checker();
            checker.registerDefaultRules();
            checker.configure({});

            var jshintConfig = options.lookup
                ? jshintRcloader.for(file.path)
                : defaultJSHintConfig;
            var jscsConfig = options.lookup
                ? jscsRcloader.for(file.path)
                : defaultJSCSConfig;

            checker.configure(jscsConfig);

            try {
                var contents = file.contents.toString();

                // jshint
                var result = jshint(contents, jshintConfig);
                if (!result) {
                    jshint.errors.forEach(function(error) {
                        if (error) {
                            file.errors.push({
                                line: error.line,
                                col: error.character,
                                message: error.reason
                            });
                        }
                    });
                }

                // jscs
                result = checker.checkString(contents, file.relative);

                result.getErrorList().forEach(function (error) {
                    file.errors.push(error);
                });

            }
            catch (error) {
                file.errors.push({
                    line: error.line,
                    column: error.column,
                    message: error.message.replace('null:', file.relative + ':')
                });
            }

            cb(null, file);

        },
        function (cb) {
            jshintRcloader = null;
            jscsRcloader = null;
            checked = null;
            cb();
        }
    );
};
