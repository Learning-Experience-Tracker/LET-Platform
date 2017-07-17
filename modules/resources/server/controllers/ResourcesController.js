'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    math = require('mathjs');

module.exports.create = function (req, res) {
    var resource = db.Resource.build({
        id_IRI: req.body.id_IRI,
        name: req.body.name,
        type: req.body.type,
        CourseId: req.body.courseId,
    });

    resource.save().then(function () {
            res.end();
        })
        .catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}

module.exports.getAll = function (req, res) {
    db.Resource
        .findAll().then(function (resourses) {
            return res.json(resourses);
        }).catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}


module.exports.get = function (req, res) {
    db.Resource.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (resource) {
        if (!resource) {
            res.status(404).end();
            return;
        }
        res.json(resource);
    }).catch(function (error) {
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.delete = function (req, res) {
    db.Resource.destroy({
        where: {
            id: req.body.resourceId
        }
    }).then(function () {
        res.end();
    }).catch(function (err) {
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.getTypes = function (req, res) {
    var resourceTypes = db.Resource.rawAttributes.type.values;
    if (resourceTypes != null) {
        return res.json(resourceTypes);
    } else {
        winston.error(err);
        res.status(500).end();
    }
}


module.exports.getResourceDashboard = function (req, res) {
    async.parallel({
        lunchedStatements: function (callback) {
            db.Statement
                .findAll({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'ResourceId']
                    },
                    where: {
                        ResourceId: req.params.id
                    },
                    order: [
                        ['id', 'ASC']
                    ],
                    include: [{
                            model: db.Resource,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'ResourceId']
                            }
                        },
                        {
                            model: db.Verb,
                            attributes: [],
                            where: {
                                name: 'launched'
                            }
                        },
                        {
                            model: db.User,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'ResourceId']
                            }
                        }
                    ],
                    raw: true,
                    nest: true
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        clickedStatements: function (callback) {
            db.Statement
                .findAll({
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'ResourceId']
                    },
                    where: {
                        ResourceId: req.params.id
                    },
                    order: [
                        ['id', 'ASC']
                    ],
                    include: [{
                            model: db.Resource,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'ResourceId']
                            }
                        },
                        {
                            model: db.Verb,
                            attributes: [],
                            where: {
                                name: 'clicked'
                            }
                        },
                        {
                            model: db.User,
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'ResourceId']
                            }
                        }
                    ],
                    raw: true,
                    nest: true
                }).then(function (statements) {
                    callback(null, statements);
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        numUniqueVisitor: function (callback) {
            // this fucking query don't work because distinct only applied on statement.id, i figured it out through enableLogging
            /*db.Statement
            .count({
                distinct: 'UserId',
                where :{ ResourceId : req.params.id},
                include : [
                    {   model : db.Verb , 
                        where :{ name : 'launched' },
                        attributes: []
                    }
                ]
            }).then(function(res){
                callback(null,res);
            }).catch(function(err){
                callback(err,null);
            });*/ // so i make this shity raw query -_-

            db.sequelize.query(
                "SELECT count(DISTINCT(`Statement`.`UserId`)) AS `count` FROM `Statements` AS `Statement` INNER JOIN `Verbs` AS `Verb` ON `Statement`.`VerbId` = `Verb`.`id` AND `Verb`.`name` = 'launched' WHERE `Statement`.`ResourceId` = " + req.params.id
            ).then(function (res) {
                callback(null, res[0][0].count);
            }).catch(function (err) {
                callback(err, null);
            });
        },
        avgLunchPerDay: function (callback) {
            db.Statement
                .findAll({
                    attributes: [
                        [db.sequelize.fn('count', db.sequelize.col('Statement.id')), 'lunchPerDay']
                    ],
                    where: {
                        ResourceId: req.params.id
                    },
                    include: [{
                        model: db.Verb,
                        attributes: [],
                        where: {
                            name: 'launched'
                        }
                    }, ],
                    group: ['Statement.timestamp'],
                    raw: true,
                    nest: true
                }).then(function (res) {
                    res = res.map(function (item) {
                        return item.lunchPerDay;
                    });
                    callback(null, math.mean(res));
                }).catch(function (err) {
                    callback(err, null);
                });
        },
        avgClickPerDay: function (callback) {
            db.Statement
                .findAll({
                    attributes: [
                        [db.sequelize.fn('count', db.sequelize.col('Statement.id')), 'clicksPerDay']
                    ],
                    where: {
                        ResourceId: req.params.id
                    },
                    include: [{
                        model: db.Verb,
                        attributes: [],
                        where: {
                            name: 'clicked'
                        }
                    }, ],
                    group: ['Statement.timestamp'],
                    raw: true,
                    nest: true
                }).then(function (res) {
                    res = res.map(function (item) {
                        return item.clicksPerDay;
                    });
                    callback(null, math.mean(res));
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


module.exports.getResourceDashboard2 = function (req, res) {
    async.parallel({
        lunchedStatements: function (callback) {
            //callback();
            db.ResStatement.findAll({
                attributes: [
                    'Date.date', [db.sequelize.fn('SUM', db.sequelize.col('ResStatement.sum_lunches')), 'sum_lunches']
                ],
                where: {
                    ResourceId: req.params.id
                },
                include: [{
                    model: db.Date,
                    attributes: []
                }],
                group: [
                    [db.sequelize.fn('DAYOFYEAR', db.sequelize.col('Date.date'))]
                ],
                raw: true
            }).then(statement => {
                //console.log(statement);
                callback(null, statement);
            });
        },
        clickedStatements: function (callback) {
            //callback();
            db.ResStatement.findAll({
                attributes: [
                    'Date.date', [db.sequelize.fn('SUM', db.sequelize.col('ResStatement.sum_clicks')), 'sum_clicks']
                ],
                where: {
                    ResourceId: req.params.id
                },
                include: [{
                    model: db.Date,
                    attributes: []
                }],
                group: [
                    [db.sequelize.fn('DAYOFYEAR', db.sequelize.col('Date.date'))]
                ],
                raw: true
            }).then(statement => {
                callback(null, statement);
            });
        },
        numUniqueVisitor: function (callback) {
            db.sequelize.query(
                "SELECT count(DISTINCT(`RS`.`UserId`)) AS `count` FROM `resstatements` AS `RS` WHERE `RS`.`ResourceId` = " + req.params.id
            ).then(function (res) {
                callback(null, res[0][0].count);
            });
        },
        avgLunchPerDay: function (callback) {
            db.ResStatement.findAll({
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.col('ResStatement.sum_lunches')), 'sum_lunches']
                ],
                where: {
                    ResourceId: req.params.id
                },
                include: [{
                    model: db.Date,
                    attributes: []
                }],
                group: [
                    [db.sequelize.fn('DAYOFYEAR', db.sequelize.col('Date.date'))]
                ],
                raw: true
            }).then(function (res) {
                res = res.map(function (item) {
                    return item.sum_lunches;
                });
                callback(null, math.mean(res));
            });
        },
        avgClickPerDay: function (callback) {
            db.ResStatement.findAll({
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.col('ResStatement.sum_clicks')), 'numOfViews']
                ],
                where: {
                    ResourceId: req.params.id
                },
                include: [{
                    model: db.Date,
                    attributes: []
                }],
                group: [
                    [db.sequelize.fn('DAYOFYEAR', db.sequelize.col('Date.date'))]
                ],
                raw: true
            }).then(function (res) {
                res = res.map(function (item) {
                    return item.sum_clicks;
                });
                callback(null, math.mean(res));
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