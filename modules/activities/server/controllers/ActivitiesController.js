'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async');

module.exports.get = function (req, res) {
    res.end();
}

module.exports.getAll = function (req, res) {
    db.Statement
        .findAll({
            where: {},
            order: [
                ['id', 'ASC']
            ],
            include: [{
                    model: db.Verb
                },
                {
                    model: db.User
                },
                {
                    model: db.Assessment
                },
                {
                    model: db.Resource
                },
                {
                    model: db.Question
                }
            ]
        }).then(function (statements) {
            return res.json(statements);
        }).catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}

module.exports.page = function (req, res) {
    db.Statement
        .findAll({
            where: {},
            order: [
                ['id', 'ASC']
            ],
            include: [{
                    model: db.Verb
                },
                {
                    model: db.User
                },
                {
                    model: db.Assessment
                },
                {
                    model: db.Resource
                },
                {
                    model: db.Question
                }
            ],
            limit: req.body.limit,
            offset: req.body.offset,
        }).then(function (statements) {
            return res.json(statements);
        }).catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}

module.exports.getCount = function (req, res) {
    db.Statement
        .findAll().then(function (statements) {
            return res.json(statements.length);
        }).catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}

module.exports.getVerbs = function (req, res) {
    db.Verb.findAll().then(function (verbs) {
        res.json(verbs);
    }).catch(function (error) {
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.create = function (req, res) {
    var rawStatement = req.body;


    var verbObject = rawStatement.verb;
    var actorObject = rawStatement.actor;
    var parentObject = rawStatement.context.contextActivities.parent[0];
    var objectObject = rawStatement.object;


    //winston.info(JSON.stringify(verbObject,null,2));
    //winston.info(JSON.stringify(objectObject,null,2));
    async.parallel({
        course: function (callback) {
            db.Course.findOne({
                where: {
                    id_IRI: parentObject.id
                }
            }).then(function (course) {
                if (!course) {
                    callback("Course Not Found " + parentObject.id, null);
                } else {
                    callback(null, course);
                }
            });
        },
        user: function (callback) {
            db.User.findOne({
                where: {
                    email: actorObject.mbox
                }
            }).then(function (user) {
                if (!user) {
                    callback("Actor Not Found " + actorObject.id, null);
                } else {
                    callback(null, user);
                }
            });
        },
        object: function (callback) {
            async.tryEach([ // try each task in series but stops whenever any of the functions were successful
                function getQuestion(callback) {
                    db.Question.findOne({
                        where: {
                            id_IRI: objectObject.id
                        }
                    }).then(function (question) {
                        if (!question) {
                            callback("Question Not Found " + objectObject.id, null);
                        } else {
                            callback(null, {
                                object: question,
                                type: 'question'
                            });
                        }
                    });
                },
                function getAssessment(callback) {
                    db.Assessment.findOne({
                        where: {
                            id_IRI: objectObject.id
                        }
                    }).then(function (assessment) {
                        if (!assessment) {
                            // fail try question
                            callback("Assessment Not Found " + objectObject.id, null);
                        } else {
                            callback(null, {
                                object: assessment,
                                type: 'assessment'
                            });
                        }
                    });
                },
                function getResource(callback) {
                    db.Resource.findOne({
                        where: {
                            id_IRI: objectObject.id
                        }
                    }).then(function (resource) {
                        if (!resource) {
                            // fail try assessment
                            callback("Resource Not Found " + objectObject.id, null);
                        } else {
                            callback(null, {
                                object: resource,
                                type: 'resource'
                            });
                        }
                    });
                },
            ], function (err, results) {
                if (err) {
                    winston.error("Object Not Found " + objectObject.id);
                    callback("Object Not Found", null);
                } else {
                    callback(null, results);
                }
            });
        },
        verb: function (callback) {
            db.Verb.findOne({
                where: {
                    id_IRI: verbObject.id
                }
            }).then(function (verb) {
                if (!verb) {
                    winston.error("Verb Not Found " + verbObject.id);
                    callback("Verb Not Found", null);
                } else {
                    callback(null, verb);
                }
            });
        }
    }, function (err, results) {
        if (err) {
            res.status(500).end();
            return;
        } else {
            winston.info("Course : " + results.course.name);
            winston.info("Actor : " + results.user.name);
            winston.info("Object : " + results.object.type);
            winston.info("Verb : " + results.verb.name);

    
            var statementObject = {
                UserId: results.user.id,
                VerbId: results.verb.id,
                timestamp: new Date(),
                stored: new Date(),
                platform: "Website",
                xapi_statement : rawStatement
            };
            console.log(results.object.object.id);

            if (results.object.type == "resource") {
                statementObject.ResourceId = results.object.object.id;
            }

            if (results.object.type == "assessment"){
                statementObject.AssessmentId = results.object.object.id;
            }

            if (results.object.type == "question"){
                statementObject.QuestionId = results.object.object.id;
            }

            var statement = db.Statement.build(statementObject);
            statement.save().then(function (newItem) {
                winston.info('Added new activity record');
                res.json("Ok");
            });
        }
        winston.info("---------------------------------");
    });
}