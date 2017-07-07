
var passport = require('./../../../../config/passport'),
    courseCtr = require('./../controllers/CoursesController'),
    acl = require('./../../../../config/acl');

module.exports = function(app){

    app.route('/api/course/all')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            courseCtr.getAll);

    app.route('/api/course/:id')
       .get(passport.authenticate('jwt', {session : false}),
            acl.adminOnly,
            courseCtr.get);

    app.route('/api/course/create')
       .post(passport.authenticate('jwt', {session : false}),
             acl.adminOnly,
             courseCtr.create);

    app.route('/api/course/delete')
       .post(passport.authenticate('jwt', {session : false}),
             acl.adminOnly,
             courseCtr.delete);
    
    app.route('/api/student/courses/all')
       .get(passport.authenticate('jwt', {session : false}),
             acl.studentOnly,
             courseCtr.getStudentCourses);

    app.route('/api/student/courses')
       .get(passport.authenticate('jwt', {session : false}),
             acl.studentOnly,
             courseCtr.getSpecifiedStudentCourses);

    app.route('/api/course/enroll')
       .post(passport.authenticate('jwt', {session : false}),
             acl.studentOnly,
             courseCtr.enroll);
}