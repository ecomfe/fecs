var fs   = require('fs');
var path = require('path');

var util = require('../util');

var reg = /(.+)\.json$/i;
var dir = __dirname;

fs.readdirSync(__dirname).forEach(function (file) {
    var match = file.match(reg);
    if (match) {
        exports[match[1]] = util.parseJSON(path.join(dir, file));
    }
});

