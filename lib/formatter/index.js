/**
 * @file additional rules for eslint
 * @author chris<wfsr@foxmail.com>
 */

// node文件系统模块（fs）
// 处理和转换文件路径的工具模块（path）
var fs   = require('fs');
var path = require('path');

// __dirname表示当前执行脚本所在的目录。
var dir = __dirname;

// __filename表示当前正在执行的脚本的文件名。它将输出文件所在位置的绝对路径，
// 且和命令行参数所指定的文件名不一定相同。如果在模块中，返回的值是模块文件的路径。
// 此处获取到的是当前模块文件文件名
// path.relative(from,to)用于将相对路径转为绝对路径。 
var cur = path.relative(dir, __filename);
// 正则匹配不包含正反斜杠并且以.js结尾的字符串
var reg = /([^\\\/]+)\.js$/i;
// fs.readdirSync(path) 同步的readdir().返回文件数组列表。
fs.readdirSync(dir).forEach(function (file) {
    if (file === cur) {
        return;
    }
    // match()不执行全局检索的时候，返回一个数组a，a[0]匹配到的字符串，a[1]第一个圆括号匹配的字符串  
    var match = file.match(reg);
    if (match) {
        var key = match[1].replace(/[A-Z]/g, function (a) {
            return '-' + a.toLowerCase();
        });

        exports[key] = require(path.join(dir, file));
    }
});
