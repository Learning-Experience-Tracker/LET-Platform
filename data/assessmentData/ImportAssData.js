var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async');

sequelize.init(function (db) {

    var admin = {};
    var oranization = {};
    var course = {};
    var courseObject = {};
    var usersMap = new Map();
    var verbsMap = new Map();
    var assessmentsMap = new Map();
    var questionSMap = new Map();

    fs.readFile('data/assessmentData/statements.json', 'utf8', function (err, data) {
        winston.info('Reading statements file.');
        if (err) throw err;
        var statements = JSON.parse(data);

        async.series([
            function (callback) {
                addAdmin(callback)
            },
            function (callback) {
                addOrganization(callback)
            },
            function (callback) {
                addCourse(callback)
            },
            function (callback) {
                addUsers(statements, callback);
            },
            function (callback) {
                addVerbs(statements, callback)
            },
            function (callback) {
                addAssessments(statements, callback)
            },
            function (callback) {
                addQuestions(statements, callback)
            },
            function (callback) {
                addActivities(statements, callback);
            }
        ], function (err) {
            winston.info('All objects are addeded');
        });
    });

    function addAdmin(callback) {
        db.User.find({
                where: {
                    username: 'admin'
                }
            })
            .then(function (adminUser) {
                if (!adminUser) { // no admin user registered
                    winston.info('No admin user found, creating...');

                    adminUser = db.User.build(adminConfigs);

                    adminUser.save().then(function (newItem) {
                        admin = newItem.dataValues;
                        winston.info('Admin user created.');
                        callback();
                    });

                } else {
                    admin = adminUser.dataValues;
                    winston.info('Admin user is already created.');
                    callback();
                }
            })
            .catch(function (error) {
                winston.error('Error with admin user...');
                winston.error(error);
                callback(error);
            });
    }

    function addOrganization(callback) {
        db.Organization.find({
                where: {
                    name: 'OU Oranization'
                }
            })
            .then(function (existOranization) {
                if (!existOranization) {
                    winston.info('No Organization found, creating...');

                    oranization = db.Organization.build({
                        name: 'Oranization 1',
                        UserId: admin.id
                    });

                    oranization.save().then(function (newItem) {
                        oranization = newItem.dataValues;
                        winston.info('Organization created.');
                        callback();
                    });

                } else {
                    oranization = existOranization.dataValues;
                    winston.info('Organization is already created.');
                    callback();
                }
            })
            .catch(function (error) {
                winston.error('Error with Organization ...');
                winston.error(error);
                callback(error);
            });
    }

    function addCourse(callback) {
        db.Course.find({
                where: {
                    name: 'Cop-3223'
                }
            })
            .then(function (existCourse) {
                if (!existCourse) {
                    winston.info('No Course found, creating...');

                    course = db.Course.build({
                        name: 'Cop-3223',
                        startDate: new Date(),
                        OrganizationId: oranization.id,
                        id_IRI: "http://adlnet.gov/samples/course/cop-3223"
                    });

                    course.save().then(function (newItem) {
                        courseObject = newItem;
                        course = newItem.dataValues;
                        winston.info('Course created.');
                        callback();
                    });

                } else {
                    course = existCourse.dataValues;
                    winston.info('Course is already created.');
                    callback();
                }
            })
            .catch(function (error) {
                winston.error('Error with Course ...');
                winston.error(error);
                callback(error);
            });
    }

    function addUsers(statements, callback) {
        winston.info('Start users import series...');
        async.eachSeries(statements, function (item, callback) {

            var firstName = item.actor.name.split(" ")[0].toLowerCase();
            var userObject = {
                name: item.actor.name,
                email: item.actor.mbox,
                username: firstName,
                password: firstName,
                role: 'student'
            };

            db.User.find({
                    where: {
                        email: userObject.email
                    }
                })
                .then(function (user) {
                    if (!user) {
                        winston.info('No user found with email ' + userObject.email);
                        user = db.User.build(userObject);

                        user.save().then(function (newItem) {
                            winston.info('User Created');
                            usersMap[newItem.dataValues.email] = newItem.dataValues;
                            user.addEnroll(courseObject, {
                                enroll_date: Date.now(),
                                enroll_times: 1
                            });
                            callback(); // process next statemnt               
                        });

                    } else {
                        winston.info('User is already created with email ' + userObject.email);
                        usersMap[user.dataValues.email] = user.dataValues;
                        callback(); // process next statement
                    }
                })
                .catch(function (error) {
                    winston.error('Error adding user');
                    winston.error(error);
                    callback(error);
                });
        }, function () {
            winston.info('All users added...');
            callback(null);
        });
    }

    function addVerbs(statement, callback) {

        var verbs = [{
            name: 'answered',
            id_IRI: 'https://w3id.org/xapi/adl/verbs/answered'
        }, {
            name: 'attempted',
            id_IRI: 'https://w3id.org/xapi/adl/verbs/attempted'
        }, {
            name: 'completed',
            id_IRI: 'https://w3id.org/xapi/adl/verbs/completed'
        }, {
            name: 'clicked',
            id_IRI: 'https://w3id.org/xapi/let/verbs/clicked'
        }, {
            name: 'loggedin',
            id_IRI: 'https://w3id.org/xapi/adl/verbs/logged-in'
        }, {
            name: 'commented',
            id_IRI: 'https://w3id.org/xapi/adl/verbs/commented'
        }, {
            name: 'launched',
            id_IRI: 'https://w3id.org/xapi/adl/verbs/launched'
        }];

        winston.info('Start verbs import series...');

        db.Verb.bulkCreate(verbs, {
            updateOnDuplicate: ['name']
        }).then(() => {
            db.Verb.findAll({}).then(verbs => {
                verbs.forEach(verb => {
                    verbsMap[verb.id_IRI] = verb;
                });
                winston.info('All verbs added...');
                callback();
            });
        });
    }

    function addAssessments(statements, callback) {
        winston.info('Start Assessments import series...');

        var assessments = [];
        var assessmentsSet = new Set();
        statements.forEach(item => {
            var verbObject = {
                name: item.verb.display['en-US'],
                id_IRI: item.verb.id
            };

            if (verbObject.name != "attempted") {
                winston.info('Next Statement');
                return;
            }

            var assesmentObject = {
                name: item.object.definition.name['en-US'],
                id_IRI: item.object.id,
                CourseId: course.id,
                deadline: new Date(),
                type: 'CMA'
            };

            if (assessmentsSet.has(assesmentObject.id_IRI))
                return;
            assessmentsSet.add(assesmentObject.id_IRI);
            assessments.push(assesmentObject);
        });

        db.Assessment.bulkCreate(assessments, {
            updateOnDuplicate: ['name']
        }).then(function (results) {
            db.Assessment.findAll().then(assessmentsObjects => {
                assessmentsObjects.forEach(assObject => {
                    assessmentsMap[assObject.id_IRI] = assObject.id;
                });
                winston.info('All Assessment created...');
                callback();
            });
        });
    }

    function addQuestions(statements, callback) {
        winston.info('Start Questions import series...');

        var questions = [];
        var questionsSet = new Set();
        statements.forEach(item => {
            var verbObject = {
                name: item.verb.display['en-US'],
                id_IRI: item.verb.id
            };

            if (verbObject.name != "answered") {
                winston.info('Next Statement');
                return;
            }

            var assessmentID = item.context.contextActivities.parent[0].id;

            var assessmenctId = assessmentsMap[assessmentID];

            var questionObject = {
                name: item.object.definition.name['en-US'],
                id_IRI: item.object.id,
                AssessmentId: assessmenctId
            };
            if (questionsSet.has(questionObject.id_IRI))
                return;
            questionsSet.add(questionObject.id_IRI);
            questions.push(questionObject);
        });

        db.Question.bulkCreate(questions, {
            updateOnDuplicate: ['name']
        }).then(function (results) {
            db.Question.findAll().then(questionsObjects => {
                questionsObjects.forEach(questionObject => {
                    questionSMap[questionObject.id_IRI] = questionObject.id;
                });
                winston.info('All questions added...');
                callback();
            });
        });
    }

    function addActivities(statements, callback) {
        winston.info('Start activities import series...');

        var statementsObjects = [];
        statements.forEach(item => {
            var verbObject = {
                name: item.verb.display['en-US'],
                id_IRI: item.verb.id
            };

            var actorDBObject = usersMap[item.actor.mbox];
            var verbDBObject = verbsMap[verbObject.id_IRI];

            var statementObject = {
                timestamp: Date.parse(item.timestamp),
                stored: Date.parse(item.stored),
                platform: "Moodle LMS",
                UserId: actorDBObject.id,
                VerbId: verbDBObject.id,
                xapi_statement: item,
                CourseId : courseObject.id
            };

            if (verbObject.name == "answered") {
                statementObject.has_result = true;
                statementObject.success = item.result.success;

                statementObject.AssessmentId = assessmentsMap[item.context.contextActivities.parent[0].id];
                statementObject.QuestionId = questionSMap[item.object.id];
            }

            if (verbObject.name == "completed") {
                statementObject.has_result = true;
                statementObject.success = item.result.success;
                statementObject.raw = item.result.score.raw;
                statementObject.min = item.result.score.min;
                statementObject.max = item.result.score.max;
                statementObject.AssessmentId = assessmentsMap[item.object.id];
            }

            if (verbObject.name == "attempted") {
                statementObject.has_result = false;
                statementObject.AssessmentId = assessmentsMap[item.object.id];
            }
            statementsObjects.push(statementObject);
        });

        var inserter = async.cargo(function (activities, inserterCallback) {
                db.Statement.bulkCreate(activities).then(function () {
                    winston.info('Batch of activities created... ' + new Date().getUTCMilliseconds());
                    inserterCallback();
                });
            },
            1000
        );

        statementsObjects.forEach(item => {
            inserter.push(item);
        });
        callback();
    }
});