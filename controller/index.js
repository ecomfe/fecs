/**
 * @file 网页控制器
 * @author chris<wfsr@foxmail.com>
 */

var site = {
    title: 'FECS - Front End Code Style Suite',
    baseurl: '',

    github: 'https://github.com/ecomfe/fecs',
    wiki: 'https://github.com/ecomfe/fecs/wiki',
    efe: 'http://efe.baidu.com',
    bce: 'http://bce.baidu.com',
    dep: 'http://s1.bdstatic.com/r/www/cache/biz/ecom/fecs'
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
