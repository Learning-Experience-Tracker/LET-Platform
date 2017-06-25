
var db = require('./sequelize'),
    adminConfigs = require('./env').adminConfigs,
    winston = require('./winston');

module.exports = function(){

    //bootstraping with admin user
    db.User.find({ where : { username : 'admin' } })
      .then(function(adminUser){
        if(!adminUser){ // no admin user registered
            winston.info('No admin user found, creating...');
            
            adminUser = db.User.build(adminConfigs);

            adminUser.save().then(function(){
                winston.info('Admin user created.');                
            });

        }else
            winston.info('Admin user is already created.');
      })
      .catch(function(error){
          winston.error('Error bootstraping with admin user...');
          winston.error(error);
      });


}