'use strict';

var express = require('express'),
    config = require('./config/config'),
    winston = require('./config/winston'),
    sequelize = require('./config/sequelize'),
    bootstrap = require('./config/bootstrap');

createApp();

function createApp(){

    winston.info("Launching...");  

    sequelize.init(function(db){
        bootstrap();

        var app = express();
        require('./config/express')(app);

        app.listen(config.port);
        winston.info("App started and running on port: " + config.port);

    });    
}