/**
 * @file 网站配置
 * @author chris<wfsr@foxmail.com>
 */

var koa = require('koa');

// 配置文件
var config = require('./config/config');

var app = koa();
app.use(function *(next) {

    // config 注入中间件，方便调用配置信息
    if (!this.config) {
        this.config = config;
    }

    yield next;
});


// swig
var render = require('koa-swig');
var markd = require('./lib/markd');

app.context.render = render(markd({
    root: config.viewDir,
    autoescape: true,
    cache: false, // 'memory',
    ext: 'html'
    // locals: locals,
    // filters: filters,
    // tags: tags,
    // extensions: extensions
}));


var session = require('koa-session');
app.use(session(app));


// post body 解析
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// 数据校验
var validator = require('koa-validator');
app.use(validator());

// 静态文件cache
var staticCache = require('koa-static-cache');
var staticDir = config.staticDir;
app.use(staticCache(staticDir + '/js'));
app.use(staticCache(staticDir + '/css'));

var serve = require('koa-static');

// stylus
var stylus = require('koa-stylus');
app.use(stylus({
    force: true,
    src: staticDir,
    dest: staticDir
}));

app.use(serve(staticDir));


// 应用路由
var appRouter = require('./router/index');
appRouter(app);

app.listen(config.port);

/* eslint-disable no-console */
console.log('listening on port %s', config.port);

module.exports = app;

