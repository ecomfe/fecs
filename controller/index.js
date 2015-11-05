/**
 * @file 网页控制器
 * @author chris<wfsr@foxmail.com>
 */

var fs = require('fs');

var site = {
    title: 'FECS - Front End Code Style Suite',
    baseurl: '',

    github: 'https://github.com/ecomfe/fecs',
    wiki: 'https://github.com/ecomfe/fecs/wiki',
    efe: 'http://efe.baidu.com',

    pluginVim: 'https://github.com/hushicai/fecs.vim',
    pluginWebstorm: 'https://github.com/leeight/Baidu-FE-Code-Style#webstorm',
    pluginSublime: 'https://github.com/leeight/Baidu-FE-Code-Style',
    pluginEclipse: 'https://github.com/ecomfe/fecs-eclipse',
    pluginVscode: 'https://github.com/21paradox/fecs-visual-studio-code',
    pluginGrunt: 'https://github.com/ecomfe/fecs-grunt',
    pluginGulp: 'https://github.com/ecomfe/fecs-gulp',
    pluginGit: 'https://github.com/cxtom/fecs-git-hooks'
};

module.exports = {

    home: function* () {
        yield this.render('index/index', {site: site});
    },

    api: function* () {
        yield this.render('api/index', {site: site});
    },

    demo: function* () {
        yield this.render('demo/index', {site: site});
    },

    plugins: function* () {
        yield this.render('plugins/index', {site: site});
    }
};
