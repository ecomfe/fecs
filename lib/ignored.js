/**
 * @file baidu reporter
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');

var through = require('through2');
var minimatch = require('minimatch');

var IGNORE_FILENAME = '.fecsignore';

/**
 * 加载忽略规则文件并解释 cli 参数中的 ignore
 *
 * @param {string} filename ignore 文件名
 * @param {Object} options minimist 处理后的 cli 参数
 * @return {Array.<string>} 包含 ignore 规则的字符串数组
 */
function load(filename, options) {
    var ignore = options.ignore || [];
    var patterns = typeof ignore === 'string' ? [ignore] : ignore;

    function valid(line) {
        line = line.trim();
        return line !== '' && line[0] !== '#';
    }

    try {
        patterns = fs.readFileSync(filename, 'utf8').split(/\r?\n/).filter(valid);
    }
    catch (e) {
        if (options.debug) {
            throw e;
        }
    }

    return patterns;
}

/**
 * 根据 .fecsignore 与 --ignore 的规则过滤文件
 *
 * @param {Object} options 配置项
 * @return {Transform} 转换流
 */
module.exports = function (options) {

    var patterns = load(IGNORE_FILENAME, options);

    return through(
        {
            objectMode: true
        },

        function (file, enc, cb) {

            var filepath = file.relative.replace('\\', '/');

            var isIgnore = patterns.reduce(function(ignored, pattern) {
                var negated = pattern[0] === '!';
                var matches;

                if (negated) {
                    pattern = pattern.slice(1);
                }

                matches = minimatch(filepath, pattern) || minimatch(filepath, pattern + '/**');

                return matches ? !negated : ignored;
            }, false);

            cb(null, !isIgnore && file);

        }
    );
};
