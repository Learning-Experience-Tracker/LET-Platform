
var passport = require('./../../../../config/passport'),
    lrsCtr = require('./../controllers/LRSController');

module.exports = function(app){

    app.route('/api/lrs/all')
       .get(passport.authenticate('jwt', {session : false}),
            lrsCtr.getAll);

    app.route('/api/lrs/:id')
       .get(passport.authenticate('jwt', {session : false}),
            lrsCtr.get);

    app.route('/api/lrs/create')
       .post(passport.authenticate('jwt', {session : false}),
             lrsCtr.create);

    
}