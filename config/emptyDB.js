(function(){
    var Sequelize = require('Sequelize'),
        winston = require('./winston'),
        config = require('./config'),
        path = require('path'),
        _ = require('lodash'),
        db = {},
        util = require('util'),
        fs = require('fs');

    winston.info('Initializing Sequelize...');

    var sequelize = new Sequelize(config.db.name, config.db.username, config.db.password, {
        host : config.db.host,
        port : config.db.port,
        dialect : config.db.dialect,
        logging : config.db.enableLogging ? winston.verbose : false
    });

    config.getDirectories(config.rootPath + '/modules').forEach(function(pack){
      var pt = config.rootPath + '/modules/' + pack + '/server/models';
        if(fs.existsSync(pt)){
              readdirSync(pt);
        }
    });

    Object.keys(db).forEach(function(modelName) {
            winston.info('Emptying ' + modelName);
            db[modelName].destroy({
                where: {},
                truncate: false
            });
    });


    
    //function of creating models
    function readdirSync(route){
        fs.readdirSync(route)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file !== 'index.js');
        })
        // import model files and save model names
        .forEach(function(file) {        
            winston.info('Loading model: ' + file);
            var model = sequelize.import(path.join(route, file));
            db[model.name] = model;
        });
    }
})();
