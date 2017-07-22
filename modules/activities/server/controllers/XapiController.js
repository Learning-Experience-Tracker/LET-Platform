'use strict';

var db = require('./../../../../config/sequelize'),
    env = require('./../../../../config/env'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    request = require('request'),
    moment = require('moment');

var options = {
    method: 'post',
    json: true,
    url: env.LRS.endpoint + 'statements',
    headers: {
        'Authorization': "Basic " + new Buffer(env.LRS.username + ":" + env.LRS.password).toString("base64"),
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.0'
    }
}

module.exports.statements = function (req, res) {
    var rawStatement;
    if (req.body instanceof Array) {
        rawStatement = req.body[0];
    } else {
        rawStatement = req.body;
    }
    var verbObject = rawStatement.verb;
    var actorObject = rawStatement.actor;
    var objectObject = rawStatement.object;
    var parentObject = rawStatement.context.contextActivities;
    var platform = rawStatement.context.platform;

    var platform = rawStatement.context.platform;
    var timestamp = moment(rawStatement.timestamp).toDate();
    var stored = moment(rawStatement.stored).toDate();


    var courseID;
    if (parentObject.hasOwnProperty('grouping')) {
        courseID = parentObject.grouping[1].id;
    } else {
        courseID = parentObject.parent[0].id;
    }


    /*console.log(verbObject.id);
    console.log("--------------------------------------------------------");
    console.log(actorObject.mbox);
    console.log("--------------------------------------------------------");
    console.log(objectObject.id);
    console.log("--------------------------------------------------------");
    console.log(courseID);
    console.log("--------------------------------------------------------");
    console.log(platform);
    console.log("--------------------------------------------------------");
    console.log(timestamp);
    console.log("--------------------------------------------------------");*/

    async.parallel({
        course: function (callback) {
            db.Course.findOne({
                where: {
                    id_IRI: courseID
                }
            }).then(function (course) {
                if (!course) {
                    callback("Course Not Found " + courseID, null);
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
                    callback("Actor Not Found " + actorObject.mbox, null);
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
                    callback(err, null);
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
                    callback("Verb Not Found " + verbObject.id, null);
                } else {
                    callback(null, verb);
                }
            });
        }
    }, function (err, results) {
        if (err) {
            winston.error(err);
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
                timestamp: timestamp,
                stored: stored,
                platform: platform,
                xapi_statement: rawStatement,
                CourseId : results.course.id
            };
            console.log(results.object.object.id);

            if (results.object.type == "resource") {
                statementObject.ResourceId = results.object.object.id;
            }

            if (results.object.type == "assessment") {
                statementObject.AssessmentId = results.object.object.id;
            }

            if (results.object.type == "question") {
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

    /*options.body = req.body;
    request(options, (error, response, body) => {
        console.log(body)
    });*/
}