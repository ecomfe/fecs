/**
 * @file 工具方法集
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');
var path = require('path');

/**
 * 构建文件匹配的 golb pattern
 *
 * @param {Array.<string>} dirs 目录
 * @param {string} extensions 扩展名
 * @return {Array.<string>} 能查找到对应 dirs 目录下目标文件的对应的 glob pattern 数组
 */
exports.buildPattern = function (dirs, extensions) {
    var transform = function (dir) {
        if (fs.existsSync(dir)) {
            var stat = fs.statSync(dir);
            return stat.isDirectory()
                ? path.join(dir, '/') + '**/*.' + extensions
                : dir;
        }
        return dir;
    };

    var patterns = dirs.map(transform).filter(Boolean);

    patterns.push('!**/{node_modules,asset,dist,release,doc,dep}/**');

    return patterns;
};


/**
 * 移除 JSON 格式中的注释
 *
 * @see github.com/sindresorhus/strip-json-comments
 * @param {string} str 输入的 JSON 字符串
 * @return {string} 移除注释后的 JSON 字符串
 */
exports.stripJsonComments = function (str) {
    var currentChar;
    var nextChar;
    var insideString = false;
    var insideComment = false;
    var ret = '';

    for (var i = 0; i < str.length; i++) {
        currentChar = str[i];
        nextChar = str[i + 1];

        if (!insideComment && str[i - 1] !== '\\' && currentChar === '"') {
            insideString = !insideString;
        }

        if (insideString) {
            ret += currentChar;
            continue;
        }

        if (!insideComment && currentChar + nextChar === '//') {
            insideComment = 'single';
            i++;
        }
        else if (insideComment === 'single' && currentChar + nextChar === '\r\n') {
            insideComment = false;
            i++;
        }
        else if (insideComment === 'single' && currentChar === '\n') {
            insideComment = false;
        }
        else if (!insideComment && currentChar + nextChar === '/*') {
            insideComment = 'multi';
            i++;
            continue;
        }
        else if (insideComment === 'multi' && currentChar + nextChar === '*/') {
            insideComment = false;
            i++;
            continue;
        }

        if (insideComment) {
            continue;
        }

        ret += currentChar;
    }

    return ret;
};

/**
 * 解释 JSON 文件为对象，允许在 JSON 中使用注释
 *
 * @param {string} file JSON 文件路径
 * @return {Object} JSON 解释后的对象
 */
exports.parseJSON = function (file) {
    var json = exports.stripJsonComments(fs.readFileSync(file, 'utf-8'));

    return JSON.parse(json);
};

var reg = /(.+)\.json$/i;

/**
 * 读取指定目录下的 JSON 配置文件，以文件名的 camelCase 形式为 key 暴露
 *
 * @param {string} dir 目录路径
 * @param {Object} out 调用模块的 exports 对象
 */
exports.readConfigs = function (dir, out) {
    fs.readdirSync(dir).forEach(function (file) {
        var match = file.match(reg);
        if (match) {
            var key = match[1].replace(/\-[a-z]/g, function (a) {
                return a[1].toUpperCase();
            });

            out[key] = exports.parseJSON(path.join(dir, file));
        }
    });
};

