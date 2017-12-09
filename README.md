FECS
==========

FECS 是基于 Node.js 的前端代码风格工具。

[![Build Status](https://img.shields.io/travis/ecomfe/fecs.svg?style=flat)](http://travis-ci.org/ecomfe/fecs)
[![Build Status](https://img.shields.io/appveyor/ci/chriswong/fecs.svg?style=flat)](https://ci.appveyor.com/project/chriswong/fecs)
[![NPM version](https://img.shields.io/npm/v/fecs.svg?style=flat)](https://www.npmjs.com/package/fecs)
[![Coverage Status](https://img.shields.io/coveralls/ecomfe/fecs.svg?style=flat)](https://coveralls.io/r/ecomfe/fecs)
[![Dependencies](https://img.shields.io/david/ecomfe/fecs.svg?style=flat)](https://david-dm.org/ecomfe/fecs)
[![DevDependencies](https://img.shields.io/david/dev/ecomfe/fecs.svg?style=flat)](https://david-dm.org/ecomfe/fecs)


### 安装

```
    $ [sudo] npm install fecs -g
```

### 使用

```
    fecs
    fecs -v
    fecs check --help
    fecs format --help
```

更多参数见 wiki: [CLI](https://github.com/ecomfe/fecs/wiki/CLI)

### API

#### fecs.leadName

设置或获取控制台输出信息前的名称，默认值为 `fecs`。

```javascript
var fecs = require('fecs');
fecs.leadName = 'edp';
...
```

#### fecs.getOptions(Array argv)

获取经 `minimist` 解释后的命令行参数对象，可用于 `fecs.check` 和 `fecs.format` 方法。

```javascript
var options = fecs.getOptions(process.argv.slice(2));

console.log(options.command); // 'check'
...
```

#### fecs.check(Object options[, Function done])

检查文件或输入流的代码规范。

```javascript
// 设置检查的文件路径
options._ = ['/path/to/check'];

// 或者设置为 stream
// options.stream = yourReadableStream;

// 设置文件类型
// options.type = 'js,css';


/**
 * callback after check finish
 *
 * @param {boolean} success true as all files ok, or false.
 * @param {Object[]} errors data for check result.
 */
function done(success, errors) {
    // blablabla
}

fecs.check(options, done);
```

#### fecs.format(Object options)

格式化、修复文件或输入流的代码。

```javascript
fecs.check(options);
```


### 工具支持

 - [x] [VIM](https://github.com/hushicai/fecs.vim)
 - [x] [WebStorm](https://github.com/leeight/Baidu-FE-Code-Style#webstorm)
 - [x] [Eclipse](https://github.com/ecomfe/fecs-eclipse)
 - [x] Sublime Text 2/3 [Baidu FE Code Style](https://github.com/leeight/Baidu-FE-Code-Style) [Sublime Helper](https://github.com/baidu-lbs-opn-fe/Sublime-fecsHelper) [SublimeLinter-contrib-fecs](https://github.com/robbenmu/SublimeLinter-contrib-fecs)
 - [x] Visual Studio Code [fecs-visual-studio-code](https://github.com/21paradox/fecs-visual-studio-code) [vscode-fecs(中文)](https://github.com/MarxJiao/VScode-fecs)
 - [x] [Atom](https://github.com/8427003/atom-fecs)
 - [x] [Emacs](https://github.com/Niandalu/flycheck-fecs)

 - [x] [Grunt](https://github.com/ecomfe/fecs-grunt)
 - [x] [Gulp](https://github.com/ecomfe/fecs-gulp)

 - [x] [Git Hook](https://github.com/cxtom/fecs-git-hooks)


### 常见问题

- <https://github.com/ecomfe/fecs/wiki/FAQ>
- <https://github.com/ecomfe/fecs/wiki/HowToFix>

更多信息请访问 <https://github.com/ecomfe/fecs/wiki>

