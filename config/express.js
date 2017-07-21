'use strict';

var express = require('express'),
    config = require('./config'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    winston = require('./winston'),
    path = require('path'),
    passport = require('./passport'),
    cors = require('cors'),
    multipart = require('connect-multiparty');

module.exports = function (app) {
    winston.info('Initializing Express...');

    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    app.use(methodOverride());

    app.use(cors());

    app.set('view engine', 'jade');

    app.set('jsAssets', config.getJavaScriptAssetsGlobals())

    //use passport 
    app.use(passport.initialize());

    app.use(multipart({
        uploadDir: config.rootPath + '/uploads'
    }));

    //setting static modules public folder
    config.getDirectories(config.rootPath + '/modules').forEach(function (pack) {
        app.use('/' + pack, express.static(config.rootPath + '/modules/' + pack + '/public'));
    });

    app.use('/bower_components/', express.static(config.rootPath + '/bower_components'));
    app.use('/theme/', express.static(config.rootPath + '/theme'));
    app.use('/docs/', express.static(config.rootPath + '/docs'));


    config.getGlobbedFiles(['./modules/*/server/routes/routes.js', './modules/*/app.js']).forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });
}