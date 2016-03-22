/**
 * @file 模块版本报告
 * @author chris<wfsr@foxmail.com>
 */

/**
 * 获取当前安装模块的版本
 *
 * @param {string[]} modules 模块名称
 * @return {Object.<string, string>} 模块名称及对应版本信息
 */
module.exports = function (modules) {
    return (modules || []).reduce(function (versions, name) {
        try {
            var pkg = require(name + '/package.json');
            versions[pkg.name] = pkg.version;
        }
        catch (e) {
            versions[name] = 'N/A';
        }

        return versions;
    }, {});
};
