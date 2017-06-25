
var passport = require('./../../../../config/passport'),
    orgCtr = require('./../controllers/OrganizationController');

module.exports = function(app){

    app.route('/api/org/all')
       .get(passport.authenticate('jwt', {session : false}),
            orgCtr.getAll);

    app.route('/api/org/:id')
       .get(passport.authenticate('jwt', {session : false}),
            orgCtr.get);

    app.route('/api/org/create')
       .post(passport.authenticate('jwt', {session : false}),
             orgCtr.create);

    
}