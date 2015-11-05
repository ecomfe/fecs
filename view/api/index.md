# <i id="start"></i>快速开始

FECS 是基于 Node.js 的前端代码风格工具套件，包含对 JavaScript、CSS 与 HTML 的检查、修复及格式化。

### <i id="cmd-install"></i>安装

```shell
$ [sudo] npm install fecs -g
```
### <i id="cmd-check"></i>代码检查

```shell
$ fecs
$ fecs path
$ fecs path/to/file
$ fecs check --help
```
### <i id="cmd-format"></i>代码修复

```shell
$ fecs format src --output=fixed
$ fecs format src --replace
$ fecs format --help
```

------

# <i id="cli"></i>FECS 命令参数

## <i id="cli-options"></i>options

| 名称 | 别名 | 值类型 | 默认值 | 说明 |
| ---  | --- | ----- | ---- | ---- |
|help|h|boolean|false|显示帮助信息|
|version|v|boolean|false|显示 `FECS` 的版本信息|

## <i id="cli-check"></i>check

```shell
$ fecs [check] [pattern...] [options]
```

使用 [ESLint]({{ site.wiki }}/ESLint) 检查 `JavaScript` 代码的质量与风格。

使用 [CSSHint]({{ site.wiki }}/CSSHint) 检查 `CSS` 代码的质量与风格。

使用 [HTMLCS]({{ site.wiki }}/HTMLCS) 检查 `HTML` 代码的质量与风格。

### pattern

指定 `glob` 风格的文件查找模式，默认为当前工作目录下的所有 `js/css/html`，也可以直接指定到具体的文件路径。

### options

| 名称 | 别名 | 值类型 | 默认值 | 说明 |
| ---  | --- | ----- | ---- | ---- |
|color|c|boolean|true|是否使用颜色高亮|
|debug|--|boolean|false|是否允许直接抛出 `FECS` 的运行时错误|
|format|--|string|--|指定 `check` 命令的结果输出格式，支持 JSON，XML 与 HTML，打开 `silient` 时也不影响输出|
|ignore|--|string|--|指定需要忽略的文件模式，多个模式可以使用多个 `--ignore` 指定|
|lookup|--|boolean|false|是否考虑所有上级目录的配置|
|maxerr|--|number|0|每个文件的最大错误数，默认为 0 表示不限制|
|maxsize|--|number|0|每个文件的最大字节数，默认为 900K， 0 表示不限制|
|reporter|--|string|--|指定 `reporter`，内置可选值只有 `baidu`，当包含 `/` 字符时从当前工作目录查找自定义的 `reporter` 实现，其它值按默认处理|
|rule|--|boolean|false|是否在错误信息最后显示对应的校验规则名称|
|silent|s|boolean|false|是否隐藏所有通过 `console.log` 输出的信息|
|sort|--|boolean|false|是否对信息按行列作升序排序|
|stream|--|boolean|false|是否使用 `process.stdin` 作为输入|
|type|--|string|js,css,html|指定要处理的文件类型，类型之间以 `,` 分隔|

## <i id="cli-format"></i>format

```shell
$ fecs format [pattern...] [options]
```

使用 [fixmyjs]({{ site.wiki }}/FixMyJS) 与 [jformatter]({{ site.wiki }}/JFormatter) 修复与格式化 `JavaScript` 代码。

使用 [CSSBeautify]({{ site.wiki }}/CSSBeautify) 与 [CSScomb]({{ site.wiki }}/CSScomb) 修复与格式化 `CSS` 代码。

使用 [HTMLCS]({{ site.wiki }}/HTMLCS) 修复与格式化 `HTML` 代码。

### options

| 名称 | 别名 | 值类型 | 默认值 | 说明 |
| ---  | --- | ----- | ---- | ---- |
|debug|--|boolean|false|是否允许直接抛出 `FECS` 的运行时错误|
|format|--|string|--|指定 `check` 命令的结果输出格式，支持 JSON，XML 与 HTML，打开 `silient` 时也不影响输出|
|ignore|--|string|--|指定需要忽略的文件模式，多个模式可以使用多个 `--ignore` 指定|
|lookup|--|boolean|false|是否考虑所有上级目录的配置|
|output|o|string|./output|指定格式化后的输出目录|
|replace|--|boolean|false|指定格式化后是否替换原文件|
|safe|s|string|medium|low -> medium -> high 三个级别对 `JavaScript` 作格式化，越往右对源码的改变越少|
|silent|s|boolean|false|是否隐藏所有通过 `console.log` 输出的信息|
|stream|--|boolean|false|是否使用 `process.stdin` 作为输入|
|type|--|string|js,css,html|指定要处理的文件类型，类型之间以 `,` 分隔|

------

# <i id="api"></i>API

## <i id="api-lead-name"></i>fecs.leadName

设置或获取控制台输出信息前的名称，默认值为 `fecs`。

```javascript
var fecs = require('fecs');
fecs.leadName = 'edp';
...
```

## <i id="api-get-options"></i>fecs.getOptions(Array argv)

获取经 `minimist` 解释后的命令行参数对象，可用于 `fecs.check` 和 `fecs.format` 方法。

```javascript
var options = fecs.getOptions(process.argv.slice(2));

console.log(options.command); // 'check'
...
```

## <i id="api-check"></i>fecs.check(Object options[, Function done])

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

## <i id="api-format"></i>fecs.format(Object options)

格式化、修复文件或输入流的代码。

```javascript
fecs.format(options);
```
