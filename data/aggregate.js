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

    async.series([
        function (callback) {
            seedDateTable(callback)
        },
        function (callback) {
            aggregateResource(callback);
        }
    ], function (err) {
        winston.info('All objects are created...');
    });


    function seedDateTable(callback) {

        db.Date.destroy({
            where: {},
            truncate: false
        });

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
    }


    function aggregateResource(callback) {
        db.Statement.findAll({
            attributes: [
                [db.sequelize.fn('date_trunc', 'day', db.sequelize.col('Statement.timestamp'))],
                'Statement.UserId', [db.sequelize.fn('count', db.sequelize.col('Statement.id')), 'lunchPerDayPerStudent']
            ],
            include: [{
                model: db.Verv,
                where: {
                    name: {
                        $eq: 'clicked'
                    }
                },
                required: true
            }],
            group: [db.sequelize.fn('date_trunc', 'day', db.sequelize.col('Statement.timestamp'), 'Statement.UserId')],
        }).then(function (statements) {
            console.log(statements);
            callback();
        });
    }
});