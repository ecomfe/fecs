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
            'boolean': ['color', 'help', 'lookup', 'silent', 'version'],
            'default': {
                color: true,
                lookup: true,
                output: './output',
                reporter: '',
                silent: false
            },
            'alias': {
                c: 'color',
                h: 'help',
                o: 'output',
                s: 'silent',
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

    require('../cli/' + cmd).run(options);
};
