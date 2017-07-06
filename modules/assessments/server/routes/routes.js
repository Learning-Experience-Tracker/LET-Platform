
var passport = require('./../../../../config/passport'),
    assessmentCtr = require('./../controllers/AssessmentsController');

module.exports = function(app){

    app.route('/api/assessment/all')
       .get(passport.authenticate('jwt', {session : false}),
            assessmentCtr.getAll);

    app.route('/api/assessment/:id')
       .get(passport.authenticate('jwt', {session : false}),
            assessmentCtr.get);

    app.route('/api/assessment/create')
       .post(passport.authenticate('jwt', {session : false}),
             assessmentCtr.create);

    app.route('/api/assessment/delete')
       .post(passport.authenticate('jwt', {session : false}),
             assessmentCtr.delete);

    app.route('/api/assessment/:id/dashboard')
       .get(passport.authenticate('jwt', {session : false}),
            assessmentCtr.getAssessmentDashboard);   
}