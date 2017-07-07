
var passport = require('./../../../../config/passport'),
    resourcesCtr = require('./../controllers/ResourcesController')
    acl = require('./../../../../config/acl');

module.exports = function(app){

    app.route('/api/resource/all')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            resourcesCtr.getAll);

    app.route('/api/resource/create')
       .post(passport.authenticate('jwt', {session : false}),
             acl.adminOnly,
             resourcesCtr.create);

    app.route('/api/resource/delete')
       .post(passport.authenticate('jwt', {session : false}),
             acl.adminOnly,
             resourcesCtr.delete);

    app.route('/api/resource/types')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            resourcesCtr.getTypes);
}