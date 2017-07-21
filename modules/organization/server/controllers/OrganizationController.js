'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.create = function (req, res) {
    var org = db.Organization.build({
        name: req.body.name,
        UserId: req.user.id
    });

    org.save().then(function (newItem) {
            res.json(newItem.id);
            res.end();
        })
        .catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}

module.exports.get = function (req, res) {
    db.Organization.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: db.Course
        }]
    }).then(function (org) {
        return res.json(org);
    }).catch(function (err) {
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.getAll = function (req, res) {
    db.Organization.findAll({
        where: {
            UserId: req.user.id
        },
        include: [{
            model: db.Course
        }]
    }).then(function (orgs) {
        return res.json(orgs);
    }).catch(function (err) {
        winston.error(err);
        res.status(500).end();
    });
}


module.exports.getDashobardDate = function (req, res) {
    db.CourseStatement.findAll({
        attributes: ['CourseStatement.sum_activities','Date.date','CourseId'],
        where: {
            CourseId: {
                $in: req.body.coursesIds
            }
        },
        include: [{
            model: db.Date,
            attributes: []
        }],
        nest: true,
        raw: true
    }).then(statements => {
        return res.json(statements);
    }).catch(function (err) {
        winston.error(err);
        res.status(500).end();
    });
}