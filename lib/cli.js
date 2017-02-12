/**
 * @file command line interface
 * @author chris<wfsr@foxmail.com>
 */

var fs       = require('fs');
var path     = require('path');
var util     = require('util');
var msee     = require('msee');
var minimist = require('minimist');

/**
 * 显示指定命令的帮助
 *
 * @param {string} cmd 命令名
 */
function displayHelp(cmd) {
    var file = path.join(__dirname, '../doc', cmd + '.md');
    var doc;

    if (fs.existsSync(file)) {
        doc = msee.parseFile(file);
    }
    else {
        doc = msee.parse(
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
                'color', 'debug', 'fix', 'help', 'lookup',
                'rule', 'replace', 'silent', 'sort', 'stream', 'version'
            ],
            'string': ['_', 'format', 'output', 'reporter'],
            'default': {
                color: true,
                es: 6,
                fix: false,
                format: '',
                lookup: true,
                maxerr: 0,
                maxsize: 1024 * 900,
                output: './output',
                reporter: ''
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

    if (cmd && fs.existsSync(path.join(__dirname, '../cli', cmd + '.js'))) {
        cmd = options._.shift();
    }
    else if (!options.help) {
        cmd = 'check';
    }

    if (options.silent && (options.format || !options.stream)) {
        console.log = function () {};
    }

    options.command = cmd;
    process.env.DEBUG = options.debug;

    return options;
};

/**
 * 命令行参数处理
 *
 * @return {void} 无返回
 */
exports.parse = function () {
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
