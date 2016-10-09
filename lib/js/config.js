/**
 * @file JS 检查规则配置模块
 * @author chris<wfsr@foxmail.com>
 */

// 自定义模块
var util = require('../util');

// 读取当前目录下的json或者yml文件，以文件名为key对外export
// json配置文件中可以使用javascript注释

// __dirname 表示当前执行脚本所在的目录。
util.readConfigs(__dirname, exports);
