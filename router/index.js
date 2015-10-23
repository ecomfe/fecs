/**
 * @file 路由配置
 * @author chris<wfsr@foxmail.com>
 */

var route = require('koa-route');

var page = require('../controller/index');
var fecs = require('../controller/fecs');

module.exports = function (app) {

    Object.keys(route).forEach(function (method) {
        app[method] = function () {
            app.use(route[method].apply(route, arguments));
        };
    });

    app.get('/', page.home);
    app.get('/api', page.api);
    app.get('/demo', page.demo);
    app.get('/plugins', page.plugins);

    app.post('/check/:type/:reporter/', fecs.check);
    app.post('/format/:type/', fecs.format);
};
