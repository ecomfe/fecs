/**
 * @file command line interface
 * @author chris<wfsr@foxmail.com>
 */

// node文件系统模块（fs）、处理和转换文件路径的工具模块（path）
// node核心模块常用函数模块（util）
var fs       = require('fs');
var path     = require('path');
var util     = require('util');
// 读取markdown文件内容的三方模块（msee）
var msee     = require('msee');
// 命令行参数解析模块三方模块（minimist）
var minimist = require('minimist');

/**
 * 显示指定命令的帮助
 *
 * @param {string} cmd 命令名
 */
function displayHelp(cmd) {
    // path.join([path1][, path2][, ...])用于连接路径。该方法的主要用途在于
    // 会正确使用当前系统的路径分隔符，Unix系统是"/"，Windows系统是"\"。

    // __dirname 表示当前执行脚本所在的目录
    var file = path.join(__dirname, '../doc', cmd + '.md');
    var doc;
    // fs.exists(path, callback)检测给定的路径是否存在。
    // fs.existsSync(path)同步版的fs.exists.
    if (fs.existsSync(file)) {
        // msee.parseFile解析markdown文件
        doc = msee.parseFile(file);
    }
    else {
        // msee.parse解析markdown文本
        doc = msee.parse(
            // https://nodejs.org/api/util.html#util_util_format_format
            util.format('Have no help for command named `%s`, check your input please.', cmd)
        );
    }

    console.log(doc);
}

/**
 * 显示 package.json 中的版本号
 *
 * @param {string[]=} modules 指定的模块名称集
 */
function displayVersion(modules) {
    var pkg = require('../package');
    console.log('%s %s', pkg.name, pkg.version);

    var versions = require('./version')(modules);
    // Object.keys返回一个数组，这个数组由对象中可枚举的自有属性的名称组成
    // forEach()方法从头至尾遍历数组，为每个元素调用指定的函数
    Object.keys(versions).forEach(function (name) {
        console.log('    %s@%s', name, versions[name]);
    });
}

/**
 * 获取命令行选项对象
 *
 * @param {Array=} argv 传入的命令行参数
 * @return {Object} minimist 对命令行参数解释后的对象
 */
exports.getOptions = function (argv) {
    var options = minimist(
        argv || [],
        {
            'boolean': [
                'color', 'debug', 'help', 'lookup',
                'rule', 'replace', 'silent', 'sort', 'stream', 'version'
            ],
            'string': ['_', 'format', 'output', 'reporter', 'safe'],
            'default': {
                color: true,
                es: 6,
                format: '',
                lookup: true,
                maxerr: 0,
                maxsize: 1024 * 900,
                output: './output',
                reporter: '',
                safe: 'medium'
            },
            'alias': {
                c: 'color',
                h: 'help',
                g: 'god',
                o: 'output',
                r: 'stream',
                s: 'silent',
                t: 'type',
                v: 'version'
            }
        }
    );


    var cmd = options._[0];
    // fs.exists(path, callback)检测给定的路径是否存在。
    // fs.existsSync(path)同步版的fs.exists.
    if (cmd && fs.existsSync(path.join(__dirname, '../cli', cmd + '.js'))) {
        // shift()方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
        cmd = options._.shift();
    }
    else if (!options.help) {
        cmd = 'check';
    }
    // 命令：silent、别名：s、值类型：boolean、默认值：false，是否隐藏所有通过console.log输出的信息
    // 命令：stream、值类型：boolean、默认值：false，是否使用process.stdin作为输入
    if (options.silent && (options.format || !options.stream)) {
        console.log = function () {};
    }

    options.command = cmd;
    // 命令：debug、值类型：boolean、默认值：false，是否允许直接抛出FECS的运行时错误
    process.env.DEBUG = options.debug;

    return options;
};

/**
 * 命令行参数处理
 *
 * @return {void} 无返回
 */
exports.parse = function () {
    // argv属性返回一个数组，由命令行执行脚本时的各个参数组成。
    // 它的第一个成员总是node，第二个成员是脚本文件名，其余成员是脚本文件的参数。
    var options = exports.getOptions(process.argv.slice(2));
    var cmd = options.command;

    if (options.version) {
        return displayVersion(options._);
    }

    if (options.help) {
        return displayHelp(cmd || 'fecs');
    }

    require('../cli/' + cmd).run(options);
};
