var passport = require('./../../../../config/passport'),
    activitiesCtr = require('./../controllers/ActivitiesController'),
    acl = require('./../../../../config/acl'),
    xapiCtr = require('./../controllers/XapiController');

module.exports = function (app) {

    app.route('/api/activity/all')
        .get(passport.authenticate('jwt', {
                session: false
            }),
            acl.adminOnly,
            activitiesCtr.getAll);

    app.route('/api/activity/count')
        .get(passport.authenticate('jwt', {
                session: false
            }),
            acl.adminOnly,
            activitiesCtr.getCount);

    app.route('/api/activity/:id')
        .get(passport.authenticate('jwt', {
                session: false
            }),
            acl.adminOnly,
            activitiesCtr.get);

    app.route('/api/activity/page')
        .post(passport.authenticate('jwt', {
                session: false
            }),
            acl.adminOnly,
            activitiesCtr.page);

    app.route('/api/verbs/all')
        .get(passport.authenticate('jwt', {
                session: false
            }),
            acl.adminOnly,
            activitiesCtr.getVerbs);

    app.route('/api/activity/create')
        .post(activitiesCtr.create);

    app.route('/api/xapi/statements')
        .post(xapiCtr.statements);
}