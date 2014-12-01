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
 */
function displayVersion() {
    var pkg = require('../package');
    console.log('%s %s', pkg.name, pkg.version);
}


/**
 * 命令行参数处理
 *
 * @return {void} 无返回
 */
exports.parse = function () {
    var options = minimist(
        process.argv.slice(2),
        {
            'boolean': ['color', 'debug', 'help', 'lookup', 'rule', 'silent', 'sort', 'stream', 'version'],
            'string': ['_', 'format', 'output', 'reporter', 'safe'],
            'default': {
                color: true,
                format: '',
                lookup: true,
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

    if (options.version) {
        return displayVersion();
    }

    if (options.help) {
        return displayHelp(cmd || 'fecs');
    }

    if (cmd && fs.existsSync(path.join(__dirname, '../cli', cmd + '.js'))) {
        options._.shift();
    }
    else {
        cmd = 'check';
    }

    if (options.silent && (options.format || !options.stream)) {
        console.log = function () {};
    }

    process.env.DEBUG = options.debug;
    require('../cli/' + cmd).run(options);
};
