var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    parse = require('csv-parse');

sequelize.init(function (db) {

    var datasetFolderPath = 'data/multiSourceDemo/'

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
        },
        function (callback) {
            addQuestions(callback);
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
                    name: 'Cooking Course'
                }
            })
            .then(function (existCourse) {
                if (!existCourse) {
                    winston.info('No Course found, creating...');

                    course = db.Course.build({
                        name: 'Cooking Course',
                        startDate: new Date(),
                        OrganizationId: oranization.id,
                        id_IRI: "http://localhost/course/view.php?id=2/"
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
        fs.readFile(datasetFolderPath + 'students.csv', 'utf8', function (err, data) {
            parse(data, {}, function (err, output) {
                
                output.shift(); // remove first row (headers)

                var users = [];

                output.forEach(function (item) {
                    var user = {};
                    user.name = item[0];
                    user.username = item[1];
                    user.password = item[2];
                    user.email = item[3];
                    user.role = 'student';
                    users.push(user);
                });

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
            });
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
        fs.readFile(datasetFolderPath + 'resources.csv', 'utf8', function (err, data) {
            parse(data, {}, function (err, output) {
                output.shift(); // remove first row (headers)

                var resources = [];

                output.forEach(function (item) {
                    var resource = {};
                    resource.id_IRI = item[0];
                    resource.type = item[1];
                    resource.name = item[2];
                    resource.platform = item[3];
                    resource.CourseId = courseObject.dataValues.id;
                    resources.push(resource);
                });

                db.Resource.bulkCreate(resources, {
                    updateOnDuplicate: ['name']
                }).then(function () {
                    winston.info("resources added");
                    callback();
                }).catch(function (error) {
                    winston.error(error);
                });
            });
        });
    }

    function addAsessments(callback) {
        fs.readFile(datasetFolderPath + 'assessments.csv', 'utf8', function (err, data) {
            parse(data, {}, function (err, output) {
                output.shift(); // remove first row (headers)

                var assessments = [];

                output.forEach(function (item) {
                    var assessment = {};
                    assessment.id_IRI = item[0];
                    assessment.name = item[1];
                    assessment.CourseId = courseObject.dataValues.id;
                    assessments.push(assessment);
                });

                db.Assessment.bulkCreate(assessments, {
                    updateOnDuplicate: ['name']
                }).then(function () {
                    winston.info("assessments added");
                    callback();
                }).catch(function (error) {
                    winston.error(error);
                });
            });
        });
    }

    function addQuestions(callback) {
        fs.readFile(datasetFolderPath + 'questions.csv', 'utf8', function (err, data) {
            parse(data, {}, function (err, output) {
                output.shift(); // remove first row (headers)

                var questions = [];

                async.eachSeries(output, (item, callback) => {

                    var question = {};
                    question.id_IRI = item[0];
                    question.name = item[1];
                    db.Assessment.findOne({
                        where: {
                            id_IRI: item[2]
                        }
                    }).then(assessment => {
                        question.AssessmentId = assessment.id;
                        questions.push(question);
                        callback(null);
                    });

                }, (err => {
                    db.Question.bulkCreate(questions, {
                        updateOnDuplicate: ['name']
                    }).then(function () {
                        winston.info("questions added");
                        callback();
                    }).catch(function (error) {
                        winston.error(error);
                    });
                }));
            });
        });
    }
});