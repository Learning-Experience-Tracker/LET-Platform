
var db = require('./mongoose'),
    adminConfigs = require('./env').adminConfigs,
    winston = require('./winston');

module.exports = function(){

    //bootstraping with admin user
    db.User.find({ username : 'admin'})
      .then(function(adminUser){
        if(adminUser.length == 0){ // no admin user registered
            winston.info('No admin user found, creating...');
            
            adminUser = new db.User(adminConfigs);

            adminUser.save();

            winston.info('Admin user created.');
        }else
            winston.info('Admin user is already created.');
      })
      .catch(function(error){
          winston.error('Error bootstraping with admin user...');
          winston.error(error);
      });


}