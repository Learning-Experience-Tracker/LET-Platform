'use strict';

var express = require('express'),
    config = require('./config/config'),
    winston = require('./config/winston'),
    mongoose = require('./config/mongoose'),
    bootstrap = require('./config/bootstrap');

createApp();

function createApp(){

    winston.info("Launching...");  

    mongoose.init()
    .then(() => {

        bootstrap();

        var app = express();
        require('./config/express')(app);

        app.listen(config.port);
        winston.info("App started and running on port: " + config.port);

    })
    .catch((error) => {
        winston.error(error);
    });
    
}