/**
 * @file js formatter
 * @author chris<wfsr@foxmail.com>
 */

var through = require('through2');
var fixmyjs = require('fixmyjs');
var jformatter = require('jformatter');
var RcLoader = require('rcloader');

function canHandle(path) {
    return /\.js$/.test(path);
}

function fix(contents, config) {
    return fixmyjs.fix(contents, config);
}


module.exports = function (options) {
    var util = require('../util');

    var defaultConfig = require('./config').jshint;
    var rcloader = new RcLoader('.jshintrc', defaultConfig, {loader: util.parseJSON});
    var formatted = {};

    return through.obj(
        function (file, enc, cb) {

            if (file.isStream()) {
                cb(new Error('Streaming not supported'));
                return;
            }

            if (formatted[file.path] || !canHandle(file.path) || file.isNull()) {
                cb(null, file);
                return;
            }

            formatted[file.path] = true;

            var config = options.lookup
                ? rcloader.for(file.path)
                : defaultConfig;

            try {
                file.contents = new Buffer(
                    jformatter.format(
                        fix(file.contents.toString(), config)
                    )
                );
            }
            catch (error) {
                this.emit('error', error);
            }

            cb(null, file);

        },
        function (cb) {
            rcloader = null;
            formatted = null;
            cb();
        }
    );
};
