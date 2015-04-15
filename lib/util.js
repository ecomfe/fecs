/**
 * @file 工具方法集
 * @author chris<wfsr@foxmail.com>
 */

var fs   = require('fs');
var path = require('path');
var util = require('util');

var RcLoader = require('rcloader2');

var CONFIG_NAME = '.fecsrc';
var rcloader;

/**
 * 获取指定路径下特定的文件配置
 *
 * @param {string} key 配置文件名
 * @param {string} filepath 要搜索的起始路径
 * @param {Object} defaults 默认配置
 * @return {Object} 合并后的搜索路径下所有的配置对象
 */
exports.getConfig = function (key, filepath, defaults) {
    if (!rcloader) {
        rcloader = new RcLoader(
            CONFIG_NAME,
            require('./config'),
            {loader: exports.parseJSON}
        );
    }

    if (!filepath) {
        filepath = process.cwd();
    }

    return rcloader.for(filepath)[key] || defaults || {};
};

/**
 * 从工作目录向上查找包含指定文件的路径
 *
 * @param {string} filename 要查找的文件名
 * @param {?string=} start 开始查找的目录，默认为当前目录
 * @return {string} 返回第一个查找到文件的路径
 */
function findPath(filename, start) {
    start = start || './';
    var filepath = path.join(start, filename);

    while (!fs.existsSync(filepath)) {
        start = path.resolve(start, '..');
        filepath = path.join(start, filename);
    }

    return start;
}

/**
 * 构建文件匹配的 golb pattern
 *
 * @param {Array.<string>=} dirs 目录
 * @param {string=} extensions 扩展名
 * @return {Array.<string>} 能查找到对应 dirs 目录下目标文件的对应的 glob pattern 数组
 */
exports.buildPattern = function (dirs, extensions) {

    extensions = (extensions || 'js,css,less,html').replace(/\s+/g, '');

    var regExt = extensions.replace(/,/g, '|').replace(/(?=[^\w|])/g, '\\');
    var validExt = new RegExp('\\.(' + regExt + ')$', 'i');
    var invalidExt = new RegExp('\\.(min|m|tpl)\\.(' + regExt + ')$', 'i');

    if (~extensions.indexOf(',')) {
        extensions = '{' + extensions + '}';
    }

    var defaultPath = './';
    if (!dirs || !dirs.length) {
        process.chdir(findPath('.fecsrc', defaultPath));
        dirs = exports.getConfig('files', defaultPath, [defaultPath]);
    }

    var specials = [];

    var filter = function (path) {
        var isValid = validExt.test(path) && !invalidExt.test(path);
        if (isValid) {
            return path;
        }

        specials.pop();
    };

    var transform = function (dir) {
        if (fs.existsSync(dir)) {
            var stat = fs.statSync(dir);
            if (dir !== defaultPath) {
                specials.push(dir);
            }

            return stat.isDirectory()
                ? path.join(dir, '/') + '**/*.' + extensions
                : filter(dir);
        }
        return dir;
    };

    var patterns = dirs.map(transform).filter(Boolean);
    if (patterns.length) {
        patterns.push('!**/{node_modules,bower_components}/**');
    }

    // HACK: CLI 中直接指定的文件或目录，可以不被 .fecsignore 忽略
    patterns.specials = specials;

    return patterns;
};


/**
 * 移除 JSON 格式中的注释
 *
 * @see github.com/sindresorhus/strip-json-comments
 * @param {string} str 输入的 JSON 字符串
 * @return {string} 移除注释后的 JSON 字符串
 */
function stripJSONComments(str) {
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
}

/**
 * 解释 JSON 文件为对象，允许在 JSON 中使用注释
 *
 * @param {string} file JSON 文件路径
 * @return {Object} JSON 解释后的对象
 */
exports.parseJSON = function (file) {

    try {
        var json = stripJSONComments(fs.readFileSync(file, 'utf-8'));
        return JSON.parse(json);
    }
    catch (e) {
        if (process.env.DEBUG === 'true') {
            throw 'JSON file error: ' + file;
        }
        return {};
    }
};

var reg = /(.+)\.json$/i;

/**
 * 读取指定目录下的 JSON 配置文件，以文件名的 camelCase 形式为 key 暴露
 *
 * @param {string} dir 目录路径
 * @param {Object} out 调用模块的 exports 对象
 */
exports.readConfigs = function (dir, out) {
    if (!fs.existsSync(dir)) {
        return;
    }

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

/**
 * 为字符固定宽度（位数）
 *
 * @param {string} src 输入字符串
 * @param {number=} width 需要固定的位数，默认为 3
 * @param {string=} chr 不够时补齐的字符，默认为 1 个空格
 * @return {string} 补齐后的字符串
 */
exports.fixWidth = function (src, width, chr) {
    src = src + '';
    chr = (chr || ' ')[0];
    width = +width || 3;
    var len = src.length;

    if (len >= width) {
        return src;
    }

    return new Array(width - len + 1).join(chr) + src;
};

/**
 * 格式化字符串
 *
 * @param {string} pattern 字符串模式
 * @param {...*} args 要替换的数据
 * @return {string} 数据格式化后的字符串
 */
exports.format = function (pattern, args) {
    return util.format.apply(null, arguments);
};


/**
 * 从 stack 中解释错误所在位置
 *
 * @param {Object} info 错误的基本信息
 * @param {Error} error 源错误对象
 * @return {(Object | Error)} 解释成功后返回包含行列和文件信息的对象，否则返回源错误对象
 */
exports.parseError = function (info, error) {

    info.origin = error;
    info.message = error.message;

    var matches = (error.stack || '').match(/\(([^:]+):(\d+):(\d+)\)/);
    if (matches) {
        info.line = matches[2] | 0;
        info.column = matches[3] | 0;
        info.message += '\(' + matches[1] + '\).';
    }
    else {
        info.line = error.line;
        info.column = 'col' in error ? error.col : error.column;
    }

    return info;
};

/**
 * 对象属性拷贝
 *
 * @param {Object} target 目标对象
 * @param {...Object} source 源对象
 * @return {Object} 返回目标对象
 */
exports.extend = function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i];
        if (src == null) {
            continue;
        }
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                target[key] = src[key];
            }
        }
    }
    return target;
};

/**
 * 混合对象
 *
 * @param {...Object} source 要混合的对象
 * @return {Object} 混合后的对象
 */
exports.mix = function () {
    var o = {};
    var src = Array.prototype.slice.call(arguments);
    return exports.extend.apply(this, [o].concat(src));
};

/**
 * 构建用于文件名匹配的正则
 *
 * @param {string|RegExp} stringSplitByComma 逗号分隔的文件名列表或匹配的正则
 * @return {RegExp} 构建后的正则
 */
exports.buildRegExp = function (stringSplitByComma) {
    if (util.isRegExp(stringSplitByComma)) {
        return stringSplitByComma;
    }

    if (!stringSplitByComma) {
        return /.*/i;
    }

    var array = String(stringSplitByComma).replace(/[^a-z\d_,\s]/gi, '\\\\$&').split(/\s*,\s*/);
    var reg = array.length === 1 ? array[0] : '(' + array.join('|') + ')';
    return new RegExp('\\.' + reg + '$', 'i');
};
