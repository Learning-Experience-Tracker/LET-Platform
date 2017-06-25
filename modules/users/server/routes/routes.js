
var passport = require('./../../../../config/passport'),
    usersCtr = require('./../controllers/UsersController');

module.exports = function(app){
    
    var usersCtr = require('../controllers/UsersController.js');

    app.route('/api/login')
       .post(passport.authenticate('local', { failureFlash: false }),
             usersCtr.login);

    app.route('/api/register')
       .post(usersCtr.register);
}