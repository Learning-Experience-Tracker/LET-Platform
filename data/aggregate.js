var sequelize = require('../config/sequelize'),
    winston = require('../config/winston'),
    adminConfigs = require('../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    moment = require('moment');


Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + parseInt(days));
    return dat;
}

sequelize.init(function (db) {


    var dateMap = new Map();

    async.series([
        function (callback) {
            seedDateTable(callback)
        },
        function (callback) {
            fillMaps(callback);
        },
        function (callback) {
            aggregateResource(callback);
        },
        function (callback) {
            aggregateCourse(callback);
        },
        function (callback){
            aggregateUser(callback);
        }
    ], function (err) {
        winston.info('All objects are created...');
    });


    function seedDateTable(callback) {
        db.Date.count({}).then(count => {
            if (count == 0) {
                var startDate = moment('2010-01-01');
                var endDate = moment('2020-01-01');

                var dates = [];
                for (var m = startDate; m.isBefore(endDate); m.add(1, 'days')) {
                    dates.push({
                        date: m.toDate(),
                        year: m.format('YYYY'),
                        month: m.format('MM'),
                        day_of_month: m.format('DD'),
                        week_of_year: m.week(),
                        day_of_week: m.format('dddd'),
                        timestamp: m.unix()
                    });
                }

                db.Date.bulkCreate(dates).then(function () {
                    winston.info("Date Table filled");
                    callback();
                });
            } else {
                callback();
            }
        });
    }

    function fillMaps(callback) {
        db.Date.findAll({
            raw: true
        }).then(dates => {
            dates.forEach(date => {
                dateMap[moment(date.date).format('MM/DD/YYYY')] = date;
            });
            callback();
        });
    }

    function aggregateResource(callback) {
        db.ResStatement.destroy({
            where: {},
            truncate: false
        }).then(() => {
            db.Statement.findAll({
                attributes: [
                    'Statement.CourseId',
                    'Statement.timestamp',
                    'Statement.UserId',
                    'Statement.ResourceId', [db.sequelize.fn('count', db.sequelize.col('Statement.id')), 'clicksPerDayPerStduentPerResource'],
                ],
                include: [{
                    model: db.Verb,
                    where: {
                        name: {
                            $in: ['clicked']
                        }
                    },
                    attributes: []
                }],
                raw: true,
                group: [
                   'Statement.CourseId',[db.sequelize.fn('DAYOFYEAR', db.sequelize.col('Statement.timestamp'))], 'Statement.UserId', 'Statement.ResourceId'
                ],
            }).then(function (statements) {
                var resStatement = [];
                statements.forEach(statement => {
                    var obj = {};
                    obj.sum_clicks = statement.clicksPerDayPerStduentPerResource;
                    obj.sum_lunches = 1;
                    obj.UserId = statement.UserId;
                    obj.ResourceId = statement.ResourceId;
                    obj.DateId = dateMap[moment(statement.timestamp).format('MM/DD/YYYY')].id;
                    obj.CourseId = statement.CourseId
                    resStatement.push(obj);
                });

                var inserter = async.cargo(function (objects, inserterCallback) {
                        db.ResStatement.bulkCreate(objects).then(function () {
                            winston.info('Batch of resources activities created... ' + new Date().getUTCMilliseconds());
                            inserterCallback();
                        });
                    },
                    5000
                );

                resStatement.forEach(item => {
                    inserter.push(item);
                });
                callback(null);
            });
        });
    }

    function aggregateCourse(callback) {
        db.CourseStatement.destroy({
            where: {},
            truncate: false
        }).then(() => {
            db.Statement.findAll({
                attributes: [
                    'Statement.CourseId', 'Statement.timestamp', [db.sequelize.fn('count', db.sequelize.col('Statement.id')), 'sum_activities'],
                ],
                raw: true,
                group: [
                   'Statement.CourseId', [db.sequelize.fn('WEEKOFYEAR', db.sequelize.col('Statement.timestamp'))]
                ],
            }).then(function (statements) {
                var resStatement = [];
                statements.forEach(statement => {
                    var obj = {};
                    obj.sum_activities = statement.sum_activities;
                    obj.DateId = dateMap[moment(statement.timestamp).format('MM/DD/YYYY')].id;
                    obj.CourseId = statement.CourseId;
                    resStatement.push(obj);
                });

                var inserter = async.cargo(function (objects, inserterCallback) {
                        db.CourseStatement.bulkCreate(objects).then(function () {
                            winston.info('Batch of course activities created... ' + new Date().getUTCMilliseconds());
                            inserterCallback();
                        });
                    },
                    1000
                );

                resStatement.forEach(item => {
                    inserter.push(item);
                });
                callback(null);
            });
        });
    }

    function aggregateUser(callback){
        db.UserStatement.destroy({
            where: {},
            truncate: false
        }).then(() => {
            db.Statement.findAll({
                attributes: [
                    'Statement.UserId', 'Statement.CourseId', 'Statement.timestamp', [db.sequelize.fn('count', db.sequelize.col('Statement.id')), 'sum_activities'],
                ],
                raw: true,
                group: [
                   'Statement.UserId', [db.sequelize.fn('WEEKOFYEAR', db.sequelize.col('Statement.timestamp'))]
                ],
            }).then(function (statements) {
                var userStatement = [];
                statements.forEach(statement => {
                    var obj = {};
                    obj.sum_activities = statement.sum_activities;
                    obj.DateId = dateMap[moment(statement.timestamp).format('MM/DD/YYYY')].id;
                    obj.CourseId = statement.CourseId;
                    obj.UserId = statement.UserId;
                    userStatement.push(obj);
                });

                var inserter = async.cargo(function (objects, inserterCallback) {
                        db.UserStatement.bulkCreate(objects).then(function () {
                            winston.info('Batch of user activities created... ' + new Date().getUTCMilliseconds());
                            inserterCallback();
                        });
                    },
                    1000
                );

                userStatement.forEach(item => {
                    inserter.push(item);
                });
                callback(null);
            });
        });
    }
});