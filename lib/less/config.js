/**
 * @file CSS 检查规则配置模块
 * @author chris<wfsr@foxmail.com>
 */

var util = require('../util');

// 读取当前目录下的 json 文件，以文件名为 key 对外 export
// json 配置文件中可以使用 javascript 注释
util.readConfigs(__dirname, exports);
