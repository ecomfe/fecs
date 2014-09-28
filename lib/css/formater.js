/**
 * @file css formatter
 * @author chris<wfsr@foxmail.com>
 */

var through     = require('through2');
var Comb        = require('csscomb');
var cssbeautify = require('cssbeautify');
var RcLoader    = require('rcloader');

function canHandle(path) {
    return /\.(css|less|sass|scss)$/.test(path);
}


module.exports = function (options) {
    var util = require('../util');

    var defaultConfig = require('./config').csscomb;
    var rcloader = new RcLoader('.csscomb.json', defaultConfig, {loader: util.parseJSON});
    var csscomb = new Comb('csscomb');
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

            csscomb.configure(config);

            try {
                file.contents = new Buffer(
                    csscomb.processString(
                        cssbeautify(file.contents.toString(), {openbrace: 'separate-line'})
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
