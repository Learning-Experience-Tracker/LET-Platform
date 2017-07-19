var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async');

sequelize.init(function (db) {

    var admin = {};
    var oranization = {};
    var courseObject = {};
    var usersMap = new Map();
    var verbsMap = new Map();
    var assessmentsMap = new Map();
    var questionSMap = new Map();


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
            addUsers(callback);
        },
        function (callback) {
            addVerbs(callback)
        },
        function (callback) {
            addResources(callback)
        },
        function (callback) {
            addAsessments(callback);
        }
    ], function (err) {
        winston.info('All objects are addeded');
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
                    name: 'Multi Source Org'
                }
            })
            .then(function (existOranization) {
                if (!existOranization) {
                    winston.info('No Organization found, creating...');

                    oranization = db.Organization.build({
                        name: 'Multi Source Org',
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
                    name: 'How to Make French Toast'
                }
            })
            .then(function (existCourse) {
                if (!existCourse) {
                    winston.info('No Course found, creating...');

                    course = db.Course.build({
                        name: 'How to Make French Toast',
                        startDate: new Date(),
                        OrganizationId: oranization.id,
                        id_IRI: "http://adlnet.gov/samples/course/api-jqm/"
                    });

                    course.save().then(function (newItem) {
                        courseObject = newItem;
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

    function addUsers(callback) {

        var users = [{
            name: "Mohammed Ghanem",
            username: "MG",
            password: "MG",
            email: "ghanem-mhd@adlnet.gov",
            role: "student"
        }, {
            name: "Aalaa alhamwi",
            username: "AA",
            password: "AA",
            email: "aalaa.alhamwi@adlnet.gov",
            role: "student"
        }, {
            name: "Bassel shemali",
            username: "BS",
            password: "BS",
            email: "bass3l@adlnet.gov",
            role: "student"
        }, {
            name: "Hania Almalki",
            username: "HA",
            password: "HA",
            email: "haniah-mk@adlnet.gov",
            role: "student"
        }];

        async.each(users, function (user, callback) {
            var userObject = db.User.build(user);
            userObject.save().then(function () {
                winston.info('User Created');
                userObject.addEnroll(courseObject, {
                    enroll_date: Date.now(),
                    enroll_times: 1
                }).then(function () {
                    callback();

                });
            });
        }, function () {
            winston.info('All users added...');
            callback(null);
        });
    }

    function addVerbs(callback) {

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

        async.eachSeries(verbs, function (verbObject, callback) {
            db.Verb.find({
                    where: {
                        id_IRI: verbObject.id_IRI
                    }
                })
                .then(function (verb) {
                    if (!verb) {
                        winston.info('No verb found with ' + verbObject.id_IRI);
                        verb = db.Verb.build(verbObject);
                        verb.save().then(function (newItem) {
                            winston.info('Verb Created');
                            verbsMap[newItem.dataValues.id_IRI] = newItem.dataValues;
                            callback(); // process next statement    
                        });

                    } else {
                        winston.info('Verb is already created ' + verbObject.id_IRI);
                        verbsMap[verb.dataValues.id_IRI] = verb.dataValues;
                        callback(); // process next statement
                    }
                })
                .catch(function (error) {
                    winston.error('Error adding verb');
                    winston.error(error);
                    callback(error);
                });
        }, function () {
            winston.info('All verbs added...');
            callback(null);
        });
    }

    function addResources(callback) {
        var resources = [{
                id_IRI: courseObject.dataValues.id_IRI + "toc",
                type: "homepage",
                name: "How to Make French Toast Homepage",
                CourseId: course.id
            }, {
                id_IRI: courseObject.dataValues.id_IRI + "01-intro",
                type: "content",
                name: " Introduction 01",
                CourseId: course.id
            }, {
                id_IRI: courseObject.dataValues.id_IRI + "02-ingredients",
                type: "content",
                name: "Ingredients 02",
                CourseId: course.id
            }, {
                id_IRI: courseObject.dataValues.id_IRI + "03-steps",
                type: "content",
                name: "Steps 03",
                CourseId: course.id
            },
            {
                id_IRI: +courseObject.dataValues.id_IRI + "04-video",
                type: "content",
                name: "Video 04",
                CourseId: course.id
            }, {
                id_IRI: courseObject.dataValues.id_IRI + "glossary",
                type: "glossary",
                name: "Course Glossary",
                CourseId: course.id
            },
            {
                id_IRI: courseObject.dataValues.id_IRI + "help",
                type: "wiki",
                name: "Wiki Help",
                CourseId: course.id
            }, {
                id_IRI: courseObject.dataValues.id_IRI + "healthy-food",
                type: "content",
                name: "Healthy Food",
                CourseId: course.id
            },
            {
                id_IRI: courseObject.dataValues.id_IRI + "drinks",
                type: "content",
                name: "Drinks",
                CourseId: course.id
            },
            {
                id_IRI: courseObject.dataValues.id_IRI + "meat-chicken",
                type: "content",
                name: "Meats & Chicken",
                CourseId: course.id
            }
        ];


        db.Resource.bulkCreate(resources).then(function () {
            winston.info("resources added");
            callback();
        }).catch(function (error) {
            winston.error(error);
        });
    }

    function addAsessments(callback) {
        var assessment = {
            name: "Quiz",
            id_IRI: "http://adlnet.gov/samples/course/api-jqm/05-quiz",
            CourseId: courseObject.dataValues.id
        };


        assessment = db.Assessment.build(assessment);

        assessment.save().then(function (newItem) {
            winston.info('Assessment created.');

            var questions = [{
                    name: "Question 1",
                    id_IRI: "http://adlnet.gov/samples/course/api-jqm/#q1",
                    AssessmentId: newItem.id
                },
                {
                    name: "Question 2",
                    id_IRI: "http://adlnet.gov/samples/course/api-jqm/#q2",
                    AssessmentId: newItem.id

                },
                {
                    name: "Question 3",
                    id_IRI: "http://adlnet.gov/samples/course/api-jqm/#q3",
                    AssessmentId: newItem.id
                }
            ];

            db.Question.bulkCreate(questions).then(function () {
                winston.info("questions added");
                callback();
            });
        });
    }
});