'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async');


module.exports.getStudentDashbaordDate = function (req, res) {
    async.parallel({
        assessmentsStatements: function (callback) {
            db.Statement
                .findAll({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'ResourceId', 'QuestionId']
                    },
                    where: {
                        UserId: req.user.id
                    },
                    include: [{
                            model: db.Assessment,
                            attributes: ['name']
                        },
                        {
                            model: db.Verb,
                            attributes: [],
                            where: {
                                name: 'completed'
                            }
                        }
                    ]
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        resourceStatements: function (callback) {
            db.Statement
                .findAll({
                    attributes: ['id', 'timestamp', 'ResourceId'],
                    where: {
                        UserId: req.user.id
                    },
                    include: [{
                            model: db.Resource,
                            attributes: ['type'],
                            where: {
                                type: {
                                    $ne: 'homepage'
                                }
                            }
                        },
                        {
                            model: db.Verb,
                            attributes: [],
                            where: {
                                name: {
                                    $in: ['launched', 'clicked']
                                }
                            }
                        }
                    ]
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
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
}


module.exports.getAdminDashbaordDate = function (req, res) {
    async.parallel({
        clickedstatements: function (callback) {
            db.Statement
                .findAll({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'ResourceId', 'QuestionId']
                    },
                    where: {
                        timestamp: {
                            $gte: req.body.startDate,
                            $lte: req.body.endDate
                        }
                    },
                    include: [{
                        model: db.Resource,
                        attributes: ['type']
                    }, {
                        model: db.Verb,
                        attributes: ['name'],
                        where: {
                            name: 'clicked'
                        }
                    }]
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        topTenAccessedResource: function (callback) {
            db.Statement
                .findAll({
                    attributes: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Statement.id')), 'numOfLaunches']
                    ],
                    where: {
                        timestamp: {
                            $gte: req.body.startDate,
                            $lte: req.body.endDate
                        }
                    },
                    include: [{
                        model: db.Resource,
                        attributes: ['name', 'id_IRI', 'type'],
                        where: {
                            type: {
                                $ne: 'homepage'
                            }
                        }
                    }, {
                        model: db.Verb,
                        attributes: [],
                        where: {
                            name: 'launched'
                        }
                    }],
                    order: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Statement.id')), 'DESC']
                    ],
                    group: 'ResourceId',
                    raw: true,
                    nest: true,
                    limit: 10
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        topTenActiveStudents: function (callback) {
            db.Statement
                .findAll({
                    attributes: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Statement.id')), 'numOfAction']
                    ],
                    where: {
                        timestamp: {
                            $gte: req.body.startDate,
                            $lte: req.body.endDate
                        }
                    },
                    include: [{
                        model: db.User,
                        attributes: ['name', 'email']
                    }],
                    order: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Statement.id')), 'DESC']
                    ],
                    group: 'UserId',
                    raw: true,
                    nest: true,
                    limit: 10
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        studensViewsHistogram : function (callback) {
            db.Statement
                .findAll({
                    attributes: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Statement.id')), 'numOfViews']
                    ],
                    where: {
                        timestamp: {
                            $gte: req.body.startDate,
                            $lte: req.body.endDate
                        }
                    },
                    order: [
                        [db.sequelize.fn('COUNT', db.sequelize.col('Statement.id')), 'ASC']
                    ],
                    group: 'UserId',
                    raw: true,
                    nest: true,
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
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
}