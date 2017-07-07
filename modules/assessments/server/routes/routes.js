
var passport = require('./../../../../config/passport'),
    assessmentCtr = require('./../controllers/AssessmentsController'),
    acl = require('./../../../../config/acl');

module.exports = function(app){

    app.route('/api/assessment/all')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            assessmentCtr.getAll);

    app.route('/api/assessment/:id')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            assessmentCtr.get);

    app.route('/api/assessment/create')
       .post(passport.authenticate('jwt', {session : false}),
             acl.adminOnly,
             assessmentCtr.create);

    app.route('/api/assessment/delete')
       .post(passport.authenticate('jwt', {session : false}),
             acl.adminOnly,
             assessmentCtr.delete);

    app.route('/api/assessment/:id/dashboard')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            assessmentCtr.getAssessmentDashboard);   
}