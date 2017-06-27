
var passport = require('./../../../../config/passport'),
    activitiesCtr = require('./../controllers/ActivitiesController');

module.exports = function(app){

    app.route('/api/activity/all')
       .get(passport.authenticate('jwt', {session : false}),
            activitiesCtr.getAll);

    app.route('/api/activity/:id')
       .get(passport.authenticate('jwt', {session : false}),
            activitiesCtr.get);    
}