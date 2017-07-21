var passport = require('./../../../../config/passport'),
	courseCtr = require('./../controllers/CourseCtr'),
	courseDashboardCtr = require('./../controllers/CourseDashboardCtr'),
	courseElementsCtr = require('./../controllers/CourseElementsCtr'),
	importCtr = require('./../controllers/ImportCtr'),
	acl = require('./../../../../config/acl');

module.exports = function (app) {

	app.route('/api/course/all')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseCtr.getAll);

	app.route('/api/course/:id')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseCtr.get);

	app.route('/api/course/:id/details')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseCtr.getDetails);

	app.route('/api/course/create')
		.post(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseCtr.create);

	app.route('/api/course/delete')
		.post(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseCtr.delete);

	app.route('/api/student/courses/all')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.studentOnly,
			courseCtr.getStudentCourses);

	app.route('/api/student/courses')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.studentOnly,
			courseCtr.getSpecifiedStudentCourses);

	app.route('/api/course/enroll')
		.post(passport.authenticate('jwt', {
				session: false
			}),
			acl.studentOnly,
			courseCtr.enroll);

	// Import Routes
	app.route('/api/admin/course/:id/import')
		.post(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			importCtr.import);

	// Dashboards Routes

	app.route('/api/admin/course/:id/dashboard')
		.post(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseDashboardCtr.getAdminDashbaordDate);

	app.route('/api/student/course/:id/dashboard')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.studentOnly,
			courseDashboardCtr.getStudentDashbaordDate);

	//Course Elements routes

	app.route('/api/admin/course/:id/assessments/:page/:pagesize')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseElementsCtr.getCourseAssessments);

	app.route('/api/admin/course/:id/resources/:page/:pagesize')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseElementsCtr.getCourseResources);

	app.route('/api/admin/course/:id/activities/:page/:pagesize')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseElementsCtr.getCourseActivities);

	app.route('/api/admin/course/:id/students/:page/:pagesize')
		.get(passport.authenticate('jwt', {
				session: false
			}),
			acl.adminOnly,
			courseElementsCtr.getCourseStudents);
}