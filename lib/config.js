/**
 * @file 所有默认的 fecs 相关配置
 * @author chris<wfsr@foxmail.com>
 */

var path = require('path');

var util = require('../lib/util');

['css', 'less', 'html', 'js'].forEach(function (dir) {
    util.readConfigs(path.join(__dirname, dir), exports);

});
