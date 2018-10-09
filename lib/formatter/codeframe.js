/**
 * @file codeFrame formatter for check results
 * @author Gavin<q414625852@163.com>
 */

const fs = require('fs');
const chalk = require('chalk');
const codeFrame = require('babel-code-frame');

const LEVEL_MAP = {
    1: 'waring',
    2: 'error'
};

const formatFilePath = (filePath, line, column) => {
    if (line && column) {
        filePath += `:${line}:${column}`;
    }
    return chalk.green(filePath);
};

const formatLevel = severity => {
    const text = LEVEL_MAP[severity];
    return severity === 1 ? chalk.yellow(text) : chalk.red(text);
};

const formatError = (path, sourceCode, error) => {
    const {line, column, severity} = error;
    const filePath = formatFilePath(path, line, column);
    const level = formatLevel(severity);
    const topMessage = `${level}: ${error.message} (${error.rule}) at ${filePath}:\n`;
    return `${topMessage}${codeFrame(sourceCode, error.line, error.column)}`;
};

module.exports = function (json) {
    let errors = 0;
    let warings = 0;
    let files = 0;
    let output = [];

    if (json.length) {

        json.forEach(file => {
            const sourceCode = fs.readFileSync(file.path, {encoding: 'utf-8'});
            const path = file.relative;
            const length = file.errors.length;
            output.push(`fecs Linter found ${length} errors in file ${formatFilePath(path)}:\n`);
            files++;
            output = output.concat(file.errors.map(error => {
                if (error.severity === 1) {
                    warings++;
                }
                else if (error.severity === 2) {
                    errors++;
                }
                return `${formatError(path, sourceCode, error)}\n\n`;
            }));
        });

        // last result
        output.push(`Result: ${errors} errors and ${warings} warings in ${files} files. `);
        output.push('Please fix them.');
    }

    process.stdout.write('\n' + output.join('') + '\n');
};
