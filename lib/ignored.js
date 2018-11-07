/**
 * @file baidu reporter
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');

var minimatch = require('minimatch');

var util = require('./util');

/**
 * 配置 fecs 忽略文件的文件名
 *
 * @const
 * @type {string}
 */
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

    if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, 'utf8').split(/\r?\n/).filter(valid).concat(patterns);
    }

    return patterns;
}

/**
 * 根据 .fecsignore 与 --ignore 的规则过滤文件
 *
 * @param {Object} options 配置项
 * @param {Array.<string>} specials 直接指定的目录或文件列表
 * @param {string} ignoreFilename 直接指定的忽略文件路径
 * @return {Transform} 转换流
 */
module.exports = function (options, specials, ignoreFilename) {

    var patterns = load(ignoreFilename || IGNORE_FILENAME, options);

    return util.mapStream(
        function (file, cb) {
            var filepath = file.relative.replace('\\', '/');

            var isSpecial = specials.some(function (dirOrPath) {
                return filepath.indexOf(dirOrPath.replace(/^\.\//, '')) === 0;
            });

            var matchOptions = {
                dot: true,
                nocase: true
            };

            var isIgnore = !isSpecial && patterns.reduce(function (ignored, pattern) {
                var negated = pattern[0] === '!';
                var matches;

                if (negated) {
                    pattern = pattern.slice(1);
                }

                matches = minimatch(filepath, pattern, matchOptions)
                    || minimatch(filepath, pattern + '/**', matchOptions);
                var result = matches ? !negated : ignored;

                if (options.debug && result) {
                    console.log('%s is ignored by %s.', filepath, pattern);
                }

                return result;
            }, false);

            if (isIgnore) {
                cb();
            }
            else {
                cb(null, file);
            }

        }
    );
};
