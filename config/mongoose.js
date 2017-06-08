var mongoose = require('mongoose'),
    env = require('./env'),
    config = require('./config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    winston = require('./winston'),
    _db = [];

var models = module.exports = {
    mongoose : mongoose,
    init : init
}

function init(){

    //set default promise implementation
    mongoose.Promise = global.Promise;

    return new Promise((resolve, reject) => {
        mongoose.connect(env.mongoDb.host + env.mongoDb.name);

        var db = mongoose.connection;

        db.on('error', (error) => {
            reject(error);
        });  

        db.once('open', () => {

            config.getDirectories(config.rootPath + '/modules').forEach(function(pack){
                var pt = config.rootPath + '/modules/' + pack + '/server/models';
                if(fs.existsSync(pt)){
                    readdirSync(pt);
                }
            });

            winston.info('we have ' + _db);
            _.extend(models, _db);

            resolve();
        });
    });

}

//function of creating models
function readdirSync(route){
    fs.readdirSync(route)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    // import model files and save model names
    .forEach(function(file) {        
        winston.info('Loading model: ' + file);
        var model = require(path.join(route, file))(mongoose);
        _db[model.name] = model.model;        
    });
}