process.env.NODE_ENV = 'test';

var prepare = require('mocha-prepare'),
    sequelize = require('../config/sequelize'),
    bootstrap = require('../config/bootstrap'),
    express = require('express'),
    config = require('../config/config'),
    winston = require('winston'),
    logger = require('../config/winston');

logger.remove(winston.transports.Console); // disable winstor logging when testing

var server;

prepare(function (done) {
    // before loading of test cases
    sequelize.init(function (db) {

        bootstrap();

        var app = express();

        module.exports = app;

        require('../config/express')(app);

        server = app.listen(config.port);

        done();
    });
}, function (done) {
    server.close();
    done();
});