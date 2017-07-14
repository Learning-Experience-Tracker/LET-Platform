'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async');


module.exports.getCourseAssessments = function (req, res) {
    db.Assessment
        .findAndCountAll({
            where: {
                CourseId: req.params.id
            },
            order: [
                ['id', 'ASC']
            ],
            limit: parseInt(req.params.pagesize),
            offset: parseInt(req.params.page) * parseInt(req.params.pagesize)
        }).then(function (result) {
            return res.json(result);
        }).catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}

module.exports.getCourseResources = function (req, res) {
    db.Resource
        .findAndCountAll({
            where: {
                CourseId: req.params.id
            },
            order: [
                ['id', 'ASC']
            ],
            limit: parseInt(req.params.pagesize),
            offset: parseInt(req.params.page) * parseInt(req.params.pagesize)
        }).then(function (result) {
            return res.json(result);
        }).catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}


module.exports.getCourseActivities = function (req, res) {
    db.Statement
        .findAndCountAll({
            include: [{
                    model: db.User,
                    attributes: ['name'],
                    include: [{
                        model: db.Course,
                        through: db.UserCourses,
                        where: {
                            id: req.params.id
                        }
                    }]
                },
                {
                    model: db.Verb,
                    attributes: ['name']
                }, {
                    model: db.Resource,
                    attributes: ['name']
                },
                {
                    model: db.Assessment,
                    attributes: ['name']
                },
                {
                    model: db.Question,
                    attributes: ['name']
                }
            ],
            order: [
                ['timestamp', 'DESC']
            ],
            limit: parseInt(req.params.pagesize),
            offset: parseInt(req.params.page) * parseInt(req.params.pagesize)
        }).then(function (result) {
            return res.json(result);
        }).catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}


module.exports.getCourseStudents = function (req, res) {
    db.Course.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (course) {
        if (!course) {
            res.status(404).end();
            return;
        }
        async.parallel({
            count: function (callback) {
                course.getUsers().then(users => {
                    callback(null, users.length);
                }).catch(error => {
                    callback(error, null);
                });
            },
            rows: function (callback) {
                course.getUsers({
                    limit: parseInt(req.params.pagesize),
                    offset: parseInt(req.params.page) * parseInt(req.params.pagesize),
                    raw : true
                }).then(users => {
                    callback(null, users);
                }).catch(error => {
                    callback(error, null);
                });
            }
        }, function (err, results) {
            if (err) {
                winston.error(err);
                res.status(500).end();
            } else {
                return res.json(results);
            }
        });
    }).catch(function (error) {
        winston.error(error);
        res.status(500).end();
    });
}