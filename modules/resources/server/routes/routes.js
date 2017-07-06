
var passport = require('./../../../../config/passport'),
    resourcesCtr = require('./../controllers/ResourcesController');

module.exports = function(app){

    app.route('/api/resource/all')
       .get(passport.authenticate('jwt', {session : false}),
            resourcesCtr.getAll);

    app.route('/api/resource/create')
       .post(passport.authenticate('jwt', {session : false}),
             resourcesCtr.create);

    app.route('/api/resource/delete')
       .post(passport.authenticate('jwt', {session : false}),
             resourcesCtr.delete);

    app.route('/api/resource/types')
       .get(passport.authenticate('jwt', {session : false}),
            resourcesCtr.getTypes);
}