var controller = require('../controller/index');

module.exports = function(app){
    app.get('/', controller.home);
    app.get('/api', controller.api);
    app.get('/demo', controller.demo);
    app.get('/plugins', controller.plugins);
};
