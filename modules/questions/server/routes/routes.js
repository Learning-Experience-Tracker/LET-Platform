
var passport = require('./../../../../config/passport'),
    questionCtr = require('./../controllers/AnalyticsQuestionController'),
    acl = require('./../../../../config/acl');

module.exports = function(app){

    app.route('/api/question/execute')
       .post(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            questionCtr.execute);

}