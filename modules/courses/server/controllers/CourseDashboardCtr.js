'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    ml = require('machine_learning');


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
                db.ResStatement
                    .findAll({
                        attributes: ['id', 'Date.date', 'ResourceId'],
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
                        }, {
                            model: db.Date,
                            attributes: ['date'],
                        }],
                        nest: true,
                        raw: true
                    }).then(function (statements) {
                        callback(null, statements);
                    }).catch(function (err) {
                        callback(err, null);
                    });
            }
        },
        function (err, results) {
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
            db.ResStatement.findAll({
                where: {
                    CourseId: req.params.id
                },
                attributes: [
                    'Date.date', 'Resource.type', [db.sequelize.fn('SUM', db.sequelize.col('ResStatement.sum_clicks')), 'sum_clicks'],
                    [db.sequelize.fn('SUM', db.sequelize.col('ResStatement.sum_lunches')), 'sum_lunches']
                ],
                include: [{
                    model: db.Resource,
                    attributes: ['type']
                }, {
                    model: db.Date,
                    attributes: [],
                    where: {
                        date: {
                            $gte: req.body.startDate,
                            $lte: req.body.endDate
                        }
                    }
                }],
                group: [
                    [db.sequelize.fn('DAYOFYEAR', db.sequelize.col('Date.date'))], 'Resource.type'
                ],
                raw: true,
                nest: true,
            }).then(function (statements) {
                callback(null, statements);
            }).catch(function (err) {
                callback(err, null);
            });
        },
        topTenAccessedResource: function (callback) {
            db.ResStatement.findAll({
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.col('sum_lunches')), 'numOfLaunches']
                ],
                where: {
                    CourseId: req.params.id
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
                    model: db.Date,
                    attributes: [],
                    where: {
                        date: {
                            $gte: req.body.startDate,
                            $lte: req.body.endDate
                        }
                    }
                }],
                group: 'ResourceId',
                order: [
                    [db.sequelize.fn('SUM', db.sequelize.col('sum_lunches')), 'DESC']
                ],
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
            db.UserStatement
                .findAll({
                    where: {
                        CourseId: req.params.id
                    },
                    attributes: [
                        ['sum_activities', 'numOfAction']
                    ],
                    include: [{
                        model: db.User,
                        attributes: ['name', 'email']
                    }, {
                        model: db.Date,
                        attributes: [],
                        where: {
                            date: {
                                $gte: req.body.startDate,
                                $lte: req.body.endDate
                            }
                        }
                    }],
                    order: [
                        ['sum_activities', 'DESC']
                    ],
                    raw: true,
                    nest: true,
                    limit: 10
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        studensViewsHistogram: function (callback) {
            db.ResStatement
                .findAll({
                    where: {
                        CourseId: req.params.id
                    },
                    attributes: [
                        [db.sequelize.fn('SUM', db.sequelize.col('ResStatement.sum_lunches')), 'numOfViews']
                    ],
                    include: [{
                        model: db.Date,
                        attributes: [],
                        where: {
                            date: {
                                $gte: req.body.startDate,
                                $lte: req.body.endDate
                            }
                        }
                    }],
                    group: 'UserId',
                    raw: true,
                    nest: true,
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        overallActivities: function (callback) {
            db.CourseStatement.findAll({
                attributes: ['CourseStatement.sum_activities', 'Date.date'],
                where: {
                    CourseId: req.params.id
                },
                include: [{
                    model: db.Date,
                    attributes: []
                }],
                nest: true,
                raw: true
            }).then(statements => {
                callback(null, statements);
            }).catch(function (err) {
                callback(err, null);
            });
        },
        clusterData: function (callback) {
            db.MiningStatement.findAll({
                where: {
                    CourseId: req.params.id,
                    weekNo: req.body.weekNo
                },
                raw: true
            }).then(data => {
                if (data.length < 0) {
                    callback(null, data);
                    return;
                }

                var input = [];
                data.forEach(item => {
                    input.push([parseInt(item.content), parseInt(item.url), parseInt(item.forum)]);
                });

                var output = ml.kmeans.cluster({
                    data: input,
                    k: 5,
                    epochs: 100
                });

                for (var i = 0; i < output.clusters.length; i++) {
                    var cluster = output.clusters[i];
                    cluster.forEach(item => {
                        data[item].cluster = i;
                    });
                }
                callback(null, data);
            });
        },
        predctionData: function (callback) {
            async.parallel({
                currentData: function (callback) {
                    db.MiningStatement.findAll({
                        where: {
                            CourseId: req.params.id,
                            weekNo: req.body.weekNo
                        },include:[{model:db.User,attributes:['name']}],
                        raw: true,
                        nest : true
                    }).then(data => {
                        callback(null, data);
                    })
                },
                pastData: function (callback) {
                    db.MiningStatement.findAll({
                        where: {
                            CourseId: {
                                $ne: req.params.id
                            },
                            weekNo: req.body.weekNo
                        },
                        raw: true
                    }).then(data => {
                        callback(null, data);
                    })
                }
            }, function (err, results) {
                var data = [];
                var final_result = [];
                var will_submit = [];
                var score = [];

                results.pastData.forEach(item => {

                    if (item.final_result == 'Fail' || item.final_result == 'Withdrawn')
                        final_result.push(0);
                    else
                        final_result.push(1);

                    if (item.willSubmit) {
                        will_submit.push(1);
                    } else {
                        will_submit.push(0);
                    }

                    score.push(item.score);

                    data.push([parseInt(item.content), parseInt(item.url), parseInt(item.forum)]);
                });

                var knnFinal = new ml.KNN({
                    data: data,
                    result: final_result
                });


                var knnwillSubmit = new ml.KNN({
                    data: data,
                    result: will_submit
                });


                var knnScore = new ml.KNN({
                    data: data,
                    result: score
                });

                results.currentData.forEach(item => {

                    var final_result = knnFinal.predict({
                        x: [item.content, item.url, item.forum],
                        k: 5
                    });
                    var will_submit = knnwillSubmit.predict({
                        x: [item.content, item.url, item.forum],
                        k: 5
                    });
                    var score = knnScore.predict({
                        x: [item.content, item.url, item.forum],
                        k: 5
                    });

                    item.atRisk = Math.round(final_result) == 1;
                    item.will_submit = Math.round(will_submit) == 1;
                    item.score = Math.round(score);
                });
                callback(null, results.currentData);
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