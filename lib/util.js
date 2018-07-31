/**
 * @file 工具方法集
 * @author chris<wfsr@foxmail.com>
 */

var fs   = require('fs');
var path = require('path');
var util = require('util');

var chalk = require('chalk');
var mapStream  = require('map-stream');
var Manis = require('manis');

var CONFIG_NAME = '.fecsrc';
var PACKAGE_NAME = 'package.json';
var JSON_YAML_REG = /(.+)\.(?:json|yml)$/i;

var rcloader;

var config = exports.config = (function (config) {
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

    var localRcloader = rcloader;
    if (!localRcloader || force) {

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

    extensions = (extensions || 'js,css,less,html')
        .replace(/\s+/g, '')
        .replace(/\bhtml?\b/gi, 'htm,html')
        .replace(/\bjs\b/gi, 'js,jsx,es,es6')
        .replace(/^,|,\s*(?=,|$)/g, '');

    var regExt = extensions.replace(/,/g, '|').replace(/(?=[^\w|])/g, '\\');
    var validExt = new RegExp('\\.(' + regExt + ')$', 'i');

    if (~extensions.indexOf(',')) {
        extensions = '{' + extensions + '}';
    }

    var defaultPath = './';
    var includeSpecials = true;
    if (!dirs || !dirs.length) {
        var cwd = findPath(CONFIG_NAME) || findPath(PACKAGE_NAME) || path.resolve(defaultPath);
        process.chdir(cwd);
        dirs = exports.getConfig('files', defaultPath, [defaultPath], true);
        includeSpecials = false;
    }

    var specials = [];

    var transform = function (dir) {
        if (fs.existsSync(dir)) {
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

    var patterns = dirs.map(transform).filter(Boolean);
    patterns.push('!**/{node_modules,bower_components}/**');

    // HACK: CLI 中直接指定的文件或目录，可以不被 .fecsignore 忽略
    patterns.specials = specials;

    return patterns;
};


/**
 * 读取指定目录下的 JSON 配置文件，以文件名的 camelCase 形式为 key 暴露
 *
 * @param {string} dir 目录路径
 * @param {Object} out 调用模块的 exports 对象
 */
function readConfigs(dir, out) {
    if (!fs.existsSync(dir)) {
        return;
    }

    fs.readdirSync(dir).forEach(function (file) {
        var match = file.match(JSON_YAML_REG);
        if (match) {
            var key = match[1].replace(/\-[a-z]/g, function (a) {
                return a[1].toUpperCase();
            });

            var filepath = path.join(dir, file);
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
