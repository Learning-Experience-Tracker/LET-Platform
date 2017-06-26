
var passport = require('./../../../../config/passport'),
    courseCtr = require('./../controllers/CoursesController');

module.exports = function(app){

    app.route('/api/course/all')
       .get(passport.authenticate('jwt', {session : false}),
            courseCtr.getAll);

    app.route('/api/course/:id')
       .get(passport.authenticate('jwt', {session : false}),
            courseCtr.get);

    app.route('/api/course/create')
       .post(passport.authenticate('jwt', {session : false}),
             courseCtr.create);

    app.route('/api/course/delete')
       .post(passport.authenticate('jwt', {session : false}),
             courseCtr.delete);
    
}