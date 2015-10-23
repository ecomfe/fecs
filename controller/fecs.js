/**
 * @file fecs 接口控制器
 * @author chris<wfsr@foxmail.com>
 */

/* eslint-disable no-console */
var fecs = require('fecs');
var _ = require('underscore');

function getFile(contents, type) {
    return {
        contents: new Buffer(contents),
        path: 'current.' + type,
        relative: 'current.' + type,
        stat: {size: contents.length},
        isNull: function () {
            return false;
        }
    };
}

function getStream(file) {
    var Stream = require('stream').Readable;
    var stream = new Stream({objectMode: true});

    stream._read = function () {
        this.push(file);
        this.push(null);
    };

    return stream;
}



var defaultOptions = fecs.getOptions();

exports.check = function* (type, reporter) {
    var code = this.request.body.code;
    var file = getFile(code, type);

    var options = _.defaults({
        command: 'check',
        stream: getStream(file),
        type: type,
        format: 'json',
        reporter: reporter
    }, defaultOptions);

    this.body = yield (function (options) {
        return function (callback) {
            var log = console.log;
            console.log = function () {};

            fecs.check(options, function () {
                console.log = log;
                callback(null, file.errors);

                options = null;
                file = null;
            });
        };
    })(options);
};


exports.format = function* (type) {
    var code = this.request.body.code;
    var file = getFile(code, type);

    var options = _.defaults({
        command: 'format',
        stream: getStream(file),
        type: type
    }, defaultOptions);

    this.body = yield (function (options) {
        return function (callback) {
            var log = console.log;
            console.log = function () {};

            fecs.format(options, function () {
                console.log = log;
                callback(null, {code: file.contents.toString()});

                options = null;
                file = null;
            });
        };
    })(options);
};
