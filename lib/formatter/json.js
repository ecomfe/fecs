/**
 * @file JSON formatter for check results
 * @author chris<wfsr@foxmail.com>
 */

module.exports = function (json) {
    process.stdout.write(JSON.stringify(json) + '\n');
};
