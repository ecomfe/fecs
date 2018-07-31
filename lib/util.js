/**
 * @file 工具方法集
 * @author chris<wfsr@foxmail.com>
 */

// node文件系统模块（fs）、处理和转换文件路径的工具模块（path）
// node核心模块常用函数模块（util）
var fs   = require('fs');
var path = require('path');
var util = require('util');
// chalk定制控制台日志的输入样式https://github.com/chalk/chalk
var chalk = require('chalk');
// 依靠它重构出了三方模块event-stream，操作流工具，事件流管道
var mapStream  = require('map-stream');
// 百度ecomfe，mains穿山甲，递归查找和读取您的配置文件
var Manis = require('manis');

// fecs支持的配置文件为.fecsrc，同时支持package.json中的fecs节点配置。
var CONFIG_NAME = '.fecsrc';
var PACKAGE_NAME = 'package.json';
// fecs支持YAML和JSON格式的配置文件。建议使用表达能力更强而书写更简便的YAML。
var JSON_YAML_REG = /(.+)\.(?:json|yml)$/i;
// 读取配置加载器
var rcloader;
// 内置配置
var config = exports.config = (function (config) {
    // forEach()方法从头至尾遍历数组，为每个元素调用指定的函数。
    // 如上所述，传递的函数作为forEach()的第一个参数。然后forEach()使用三个参数
    // 调用该函数：数组元素、元素的索引和数组本身
    ['css', 'less', 'html', 'js'].forEach(function (dir) {
        readConfigs(path.join(__dirname, dir), config);
    });
    return config;
})({});

/**
 * 获取指定路径下特定的文件配置
 *
 * @param {string} key 配置文件名
 * @param {string} filepath 要搜索的起始路径
 * @param {Object} defaults 默认配置
 * @param {boolean} force 强制重新读取配置
 * @return {Object} 合并后的搜索路径下所有的配置对象
 */
exports.getConfig = function (key, filepath, defaults, force) {
    defaults = defaults || {};

    // 未提供起始路径时，使用内置配置
    if (!filepath) {
        return config[key] || defaults;
    }
    // 本地读取配置加载器
    var localRcloader = rcloader;
    if (!localRcloader || force) {
        // 百度ecomfe，mains穿山甲，递归查找和读取您的配置文件
        localRcloader = new Manis({
            enableRoot: true, // 支持 root 配置属性
            files: [
                CONFIG_NAME,
                {name: PACKAGE_NAME, get: 'fecs'},
                {
                    name: '.eslintrc',
                    get: function (eslint) {
                        eslint.fecs = true;
                        return {eslint: eslint};
                    }
                }
            ]
        });

        localRcloader.setDefault(config);
        if (!rcloader) {
            rcloader = localRcloader;
        }
    }

    return localRcloader.from(filepath)[key] || defaults;
};

/**
 * 处理来自 .eslintrc 的配置文件，自动合并 plugins
 *
 * @param {Object} config 通过 util.getConfig 读到的配置对象
 * @param {string} name 默认配置的 key
 * @return {Object} 返回处理过的 config
 */
exports.parseExtends = function (config, name) {
    var fecs = config.fecs;
    if (!fecs) {
        return config;
    }

    fecs = exports.getConfig(name);

    var plugins = config.plugins;
    if (!Array.isArray(plugins)) {
        plugins = [plugins];
    }

    var map = fecs.plugins.reduce(function (map, name) {
        map[name] = true;
        return map;
    }, {});

    config.plugins = fecs.plugins.concat(
        plugins.filter(
            function (name) {
                return !map[name];
            }
        )
    );

    config.fecs = false;

    return config;
};


/**
 * 从工作目录向上查找包含指定文件的路径
 *
 * @param {string} filename 要查找的文件名
 * @param {?string=} start 开始查找的目录，默认为当前目录
 * @return {(string|boolean)} 第一个能查找到文件的路径，否则返回 false
 */
function findPath(filename, start) {
    // path.resolve([from ...], to)将to参数解析为绝对路径。
    start = path.resolve(start || './');
    var root = path.resolve('/');
    var filepath = path.join(start, filename);

    var dir = start;
    while (dir !== root) {
        filepath = path.join(dir, filename);

        if (fs.existsSync(filepath)) {
            return dir;
        }

        dir = path.resolve(dir, '..');
    }

    return false;
}

/**
 * 构建文件匹配的 golb pattern
 *
 * @param {Array.<string>=} dirs 目录
 * @param {string=} extensions 扩展名
 * @return {Array.<string>} 能查找到对应 dirs 目录下目标文件的对应的 glob pattern 数组
 */
exports.buildPattern = function (dirs, extensions) {
    // “\s”任何Unicode空白符
    // “\b”匹配一个单词的边界
    extensions = (extensions || 'js,css,less,html')
        .replace(/\s+/g, '')
        .replace(/\bhtml?\b/gi, 'htm,html')
        .replace(/\bjs\b/gi, 'js,jsx,es,es6')
        .replace(/^,|,\s*(?=,|$)/g, '');
    // “\w”任何ASCII字符组成的单词，等价于[a-zA-Z0-9]
    // regExt：“js|es|es6|css|less|htm|html”
    var regExt = extensions.replace(/,/g, '|').replace(/(?=[^\w|])/g, '\\'); 
    // validExt：“/\.(js|es|es6|css|less|htm|html)$/i”
    var validExt = new RegExp('\\.(' + regExt + ')$', 'i');
    if (~extensions.indexOf(',')) {
        // extensions：“{js,es,es6,css,less,htm,html}”
        extensions = '{' + extensions + '}';
    }

    var defaultPath = './';
    var includeSpecials = true;
    if (!dirs || !dirs.length) {
        // 自定义方法findPath(filename,start)从工作目录向上查找包含指定文件的路径
        // filename 要查找的文件名，start 开始查找的目录，默认为当前目录
        // return 第一个能查找到文件的目录路径，否则返回false
        // path.resolve([from ...], to)将to参数解析为绝对路径。
        var cwd = findPath(CONFIG_NAME) || findPath(PACKAGE_NAME) || path.resolve(defaultPath);
        // process.chdir(directory)改变当前工作进程的目录，如果操作失败抛出异常。
        process.chdir(cwd);
        // 获取指定路径下特定的文件配置
        dirs = exports.getConfig('files', defaultPath, [defaultPath], true);
        includeSpecials = false;
    }

    var specials = [];

    var transform = function (dir) {
        if (fs.existsSync(dir)) {
            // 通过异步模式获取文件信息的语法格式：fs.stat(path, callback)异步stat(). 回调函数有两个参数err, stats，stats是fs.Stats对象。
            // fs.statSync(path)同步stat(). 返回fs.Stats的实例。
            var stat = fs.statSync(dir);
            if (dir !== defaultPath
                && (stat.isDirectory() || stat.isFile() && validExt.test(dir))
                && includeSpecials
            ) {
                specials.push(dir);
            }

            return stat.isDirectory()
                ? path.join(dir, '/') + '**/*.' + extensions
                : dir;
        }
        return dir;
    };
    // map()方法将调用的数组的每个元素传递给指定的函数，并返回一个数组，它包含该函数的返回值
    var patterns = dirs.map(transform).filter(Boolean);
    patterns.push('!**/{node_modules,bower_components}/**');

    // HACK: CLI 中直接指定的文件或目录，可以不被 .fecsignore 忽略
    patterns.specials = specials;

    return patterns;
};


/**
 * 读取指定目录下的配置文件，以文件名的camelCase形式为key暴露
 *
 * @param {string} dir 目录路径
 * @param {Object} out 调用模块的 exports 对象
 */
function readConfigs(dir, out) {
    // fs.exists(path, callback)检测给定的路径是否存在。
    // fs.existsSync(path)同步版的fs.exists.
    if (!fs.existsSync(dir)) {
        return;
    }
    // fs.readdir(path, callback)异步readdir()，读取目录的内容。返回文件数组列表。
    // fs.readdirSync(path)同步readdir()，读取目录的内容，返回文件数组列表。
    fs.readdirSync(dir).forEach(function (file) {
        // match()方法返回的是一个由匹配结果组成的的数组。如果该正则表达式设置了修饰符g，
        // 则该方法返回的数组包含字符串中的所有匹配结果，如果没有设置修饰符g
        // 返回的数组a，a[0]存放的是完整的匹配，a[1]存放的则是与第一个用圆括号括起来的表达式相匹配的子串
        var match = file.match(JSON_YAML_REG);
        if (match) {
            // replace 检索并替换
            var key = match[1].replace(/\-[a-z]/g, function (a) {
                // 匹配到的字符转换为大写。例如css-abc转换为cssAbc
                return a[1].toUpperCase();
            });

            var filepath = path.join(dir, file);
            // 百度ecomfe，mains穿山甲，递归查找和读取您的配置文件
            out[key] = Manis.loader(fs.readFileSync(filepath, 'utf-8'), filepath);
        }
    });
}

exports.readConfigs = readConfigs;

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
    // 使用+来转换为整数
    width = +width || 3;
    var len = src.length;

    if (len >= width) {
        return src;
    }
    // Array.join()方法将数组中所有元素都转化为字符串并连接在一起，返回最后生成的字符串
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

    var matches = (error.stack || '').match(/\(?(.+?\.js):(\d+)(:(\d+))?\)?/);
    if (!('lineNumber' in error) && matches) {
        info.line = matches[2] | 0;
        if (matches[4]) {
            info.column = matches[4] | 0;
        }

        var errorMessages = matches.input.match(/^.*?([a-z]*Error:[^\r\n]+).*$/mi);
        if (errorMessages) {
            info.message = errorMessages[1];
        }

        info.message += '\(' + matches[1].replace(/^.+\/fecs\/(.+)$/, '~/$1') + '\).';
    }
    else {
        info.line = error.line;
        info.column = 'col' in error ? error.col : error.column;
    }

    info.code = error.code || info.code || '998';
    info.rule = error.rule || info.rule || 'syntax';

    return info;
};

/**
 * 对象属性拷贝
 *
 * @param {Object} target 目标对象
 * @param {...Object} source 源对象
 * @return {Object} 返回目标对象
 */
exports.extend = function extend(target) {
    function isObject(obj) {
        var toString = Object.prototype.toString;
        return toString.call(obj) === '[object Object]';
    }

    for (var i = 1; i < arguments.length; i++) {
        var src = arguments[i];

        if (src == null) {
            continue;
        }

        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                target[key] = isObject(src[key])
                    ? extend(isObject(target[key]) ? target[key] : {}, src[key])
                    : src[key];
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

    var array = String(stringSplitByComma).replace(/[^a-z\d_,\s]/gi, '\\$&').split(/\s*,\s*/);
    var reg = array.length === 1 ? array[0] : '(' + array.join('|') + ')';
    return new RegExp('\\.' + reg + '$', 'i');
};

/**
 * 为在控制台输出的字符着色
 *
 * @param {string} text 要着色的字符
 * @param {string=} color chalk 合法的颜色名，非法名将导致不着色
 * @return {string}  着色后的字符
 */
exports.colorize = function (text, color) {
    if (color && chalk[color]) {
        return chalk[color](text);
    }

    return text;
};

/**
 * map-stream 化
 *
 * @param {Function} transform transform 操作
 * @param {Function=} flush flush 操作
 * @return {Transform}  转换流
 */
exports.mapStream = function (transform, flush) {
    var stream = mapStream(transform);
    if (typeof flush === 'function') {
        stream.on('end', flush);
    }

    return stream;
};

/**
 * List all variable in a given scope (from eslint-plugin-react)
 *
 * @param {Object} context The current rule context.
 * @param {Array} name The name of the variable to search.
 * @return {boolean} True if the variable was found, false if not.
 */
exports.variablesInScope = function (context) {
    var scope = context.getScope();
    var variables = scope.variables;

    while (scope.type !== 'global') {
        scope = scope.upper;
        variables = variables.concat(scope.variables);
    }

    return variables;
};

/* eslint-disable max-len */
/**
 * 匹配数组的静态方法
 *
 * @const
 * @type {RegExp}
 */
const ARRAY_STATIC_PATTERN = /^Array[\s\r\n]*\.[\s\r\n]*(?:from|of|call|apply)\b/;

/**
 * 匹配数组的实例方法
 *
 * @const
 * @type {RegExp}
 */
const ARRAY_PROTO_PATTERN = /^Array[\s\r\n]*\.[\s\r\n]*prototype[\s\r\n]*\.[\s\r\n]*(?:concat|copyWithin|entries|filter|fill|keys|map|values|reverse|slice|sort|splice)\b/;

/**
 * 匹配对象转数组的方法
 *
 * @const
 * @type {RegExp}
 */
const OBJECT_ARRAY_PATTERN = /^Object[\s\r\n]*\.[\s\r\n]*(?:keys|values|entries)\b/;
/* eslint-enable max-len */

/**
 * 匹配对象创建的静态方法
 *
 * @const
 * @type {RegExp}
 */
const OBJECT_STATIC_PATTERN = /^Object[\s\r\n]*\.[\s\r\n]*(?:create|assign)\b/;

exports.isArrayNode = function (context) {
    return function isArrayNode(node, name) {
        switch (node.type) {
            case 'Identifier':
                if (node.parent) {
                    if (node.parent.type === 'RestElement') {
                        return true;
                    }

                    if (node.parent.type === 'ArrayPattern') {
                        return false;
                    }
                }


                var variable;
                exports.variablesInScope(context).some(function (item) {
                    if (item.name === node.name) {
                        variable = item;
                        return true;
                    }
                    return false;
                });

                if (!variable) {
                    return false;
                }

                // variableName = variableName.slice(0)
                if (variable.name === name) {
                    return true;
                }

                return variable.references.reduceRight(function (result, ref) {
                    var writeExpr = ref.writeExpr;
                    if (!result && writeExpr) {

                        // variableName = variableName
                        if (writeExpr.type === 'Identifier' && writeExpr.name === variable.name) {
                            return false;
                        }

                        result = isArrayNode(ref.writeExpr, variable.name);
                    }
                    return result;
                }, false);

            case 'ArrayExpression':
                return true;

            case 'NewExpression':
                return String(node.callee.name).slice(-5) === 'Array';

            case 'CallExpression':
                var callee = node.callee;
                var code = context.getSourceCode().getText(callee);
                return String(callee.name).slice(-5) === 'Array'
                    || code.match(ARRAY_STATIC_PATTERN)
                    || code.match(ARRAY_PROTO_PATTERN)
                    || code.match(OBJECT_ARRAY_PATTERN)
                    || callee.type === 'MemberExpression'
                    && isArrayNode(callee, name);

            case 'MemberExpression':
                return (node.property.name === 'prototype'
                    || ARRAY_PROTO_PATTERN.test('Array.prototype.' + node.property.name))
                    && isArrayNode(node.object, name);
        }

        return false;
    };
};


exports.isObjectNode = function (context) {
    var isArray = exports.isArrayNode(context);

    return function isObjectNode(node, name) {
        if (isArray(node)) {
            return false;
        }

        var type = node.type;
        switch (type) {

            case 'Identifier':
                if (node.parent && node.parent.type === 'Property') {
                    return node.parent.parent.type === 'RestProperty';
                }

                var variable;
                exports.variablesInScope(context).some(function (item) {
                    if (item.name === node.name) {
                        variable = item;
                        return true;
                    }
                    return false;
                });

                if (!variable) {
                    return false;
                }

                // variableName = variableName
                if (variable.name === name) {
                    return false;
                }

                return variable.references.reduceRight(function (result, ref) {
                    if (!result && ref.writeExpr) {
                        result = isObjectNode(ref.writeExpr, variable.name);
                    }
                    return result;
                }, false);

            case 'ObjectExpression':
                return true;

            case 'NewExpression':
                return node.callee.name !== 'Array';

            case 'CallExpression':
                var callee = node.callee;
                return callee.name === 'Object'
                    || callee.type === 'MemberExpression'
                    && isObjectNode(callee, name);

            case 'MemberExpression':
                var code = context.getSourceCode().getText(node);

                return node.parent
                    && node.parent.type !== 'MemberExpression'
                    && node.property.name === 'prototype'
                    || code.match(OBJECT_STATIC_PATTERN);
        }

        return false;
    };
};
