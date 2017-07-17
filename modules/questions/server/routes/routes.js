
var passport = require('./../../../../config/passport'),
    questionCtr = require('./../controllers/AnalyticsQuestionController'),
    acl = require('./../../../../config/acl');

module.exports = function(app){

    app.route('/api/question/execute')
       .post(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            questionCtr.execute);

    app.route('/api/question/all')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            questionCtr.getAllQuestions);
    
    app.route('/api/question/:id')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            questionCtr.get);
}