/**
 * @file command line interface
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');
var path = require('path');

var reg = /(.+)\.js$/i;
var dir = path.join(__dirname, './cli');
fs.readdirSync(dir).forEach(function (file) {
    var match = file.match(reg);
    if (match) {
        var key = match[1].replace(/\-[a-z]/g, function (a) {
            return a[1].toUpperCase();
        });

        exports[key] = require(path.join(dir, file)).run;
    }
});

exports.getOptions = require('./lib/cli').getOptions;

var leadName = require('./package').name;

Object.defineProperty(exports, 'leadName', {
    set: function (value) {
        leadName = value;
    },

    get: function () {
        return leadName;
    }
});
