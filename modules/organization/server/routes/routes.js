
var passport = require('./../../../../config/passport'),
    orgCtr = require('./../controllers/OrganizationController'),
    acl = require('./../../../../config/acl');

module.exports = function(app){

    app.route('/api/org/all')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            orgCtr.getAll);

    app.route('/api/org/:id')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            orgCtr.get);

    app.route('/api/org/create')
       .post(passport.authenticate('jwt', {session : false}),
             acl.adminOnly,
             orgCtr.create);

    
}