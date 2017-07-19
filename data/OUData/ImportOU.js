var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    parse = require('csv-parse');


Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + parseInt(days));
    return dat;
}

sequelize.init(function (db) {

    var datasetFolderPath = 'data/OUData/AAA2013J/'
    var maxLimit = 100; // max insert operation in parallel
    var admin = {};
    var oranization = {};

    var coursesMap = new Map();
    var resourcesMap = new Map();
    var assessmentMap = new Map();
    var usersMap = new Map();
    var verbsMap = new Map();
    var courseStudentMap = new Map();

    async.series([
        function (callback) {
            addAdmin(callback)
            //callback();                
        },
        function (callback) {
            addOrganization(callback);
            //callback();         
        },
        function (callback) {
            addCourse(callback);
            //callback();              
        },
        function (callback) {
            addResources(callback);
            //callback();
        },
        function (callback) {
            addAssessments(callback);
            //callback();
        },
        function (callback) {
            addUsers(callback);
            //callback();
        },
        function (callback) {
            addRegistered(callback);
            //callback();
        },
        function (callback) {
            addVerbs(callback);
            //callback();
        },
        function (callback) {
            addResourcesLunchedActivites(callback);
            //callback();
        },
        function (callback) {
            addResourcesClickedActivites(callback);
            //callback();
        },
        function (callback) {
            addAssActivites(callback);
            //callback();
        }
    ], function (err) {
        winston.info('All objects are created...');
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
                        name: 'OU Oranization',
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
        winston.info('Begin reading courses file');
        fs.readFile(datasetFolderPath + 'courses.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing courses csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var courses = [];

                output.forEach(function (item) {
                    var name = item[0];
                    var date = item[1];
                    var length = item[2];

                    var courseObject = {
                        name: name + date
                    };

                    switch (date) {
                        case "2013J":
                            courseObject.startDate = new Date(2013, 9, 1, 3);
                            break;
                        case "2013B":
                            courseObject.startDate = new Date(2013, 1, 1 ,3);
                            break;
                        case "2014J":
                            courseObject.startDate = new Date(2014, 9, 2 ,3);
                            break;
                        case "2014B":
                            courseObject.startDate = new Date(2014, 1, 1, 3);
                            break;
                    }
                    var date = new Date(courseObject.startDate);
                    courseObject.endDate = date.addDays(length);
                    courseObject.id_IRI = "http://open-university.edu/" + courseObject.name.toLowerCase();
                    courseObject.OrganizationId = oranization.id;
                    courses.push(courseObject);
                });
                winston.info('Start courses import series..');
                db.Course.bulkCreate(courses, {
                    updateOnDuplicate: ['startDate','endDate']
                }).then(results => {

                    db.Course.findAll({}).then(coursesObjects => {
                        coursesObjects.forEach(courseObject => {
                            coursesMap[courseObject.name] = courseObject;
                        });
                        winston.info('All courses created...');
                        callback(null);
                    });
                });
            });
        });
    }

    function addResources(callback) {
        winston.info('Begin reading resources file');
        fs.readFile(datasetFolderPath + 'resrouces.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing resources csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var resources = [];

                output.forEach(function (item) {
                    var res = {};
                    var courseName = item[2] + item[1];
                    var courseDBObject = coursesMap[courseName];
                    res.name = item[0];
                    res.CourseId = courseDBObject.id;
                    res.id_IRI = "http://open-university.edu/" + courseName.toLowerCase() + "/resources/" + item[0];
                    res.type = item[3];

                    resources.push(res);
                });

                winston.info('Start resources import series..');

                db.Resource.bulkCreate(resources, {
                    updateOnDuplicate: ['name']
                }).then(function (results) {
                    db.Resource.findAll({ // to get resource ids because results don't have id see bulkCreate docs
                        where: {
                            CourseId: results[0].CourseId
                        }
                    }).then(resObjects => {
                        resObjects.forEach(resObject => {
                            resourcesMap[resObject.name] = resObject.id;
                        });
                        winston.info('All resources created...');
                        callback(null);
                    });
                });
            });
        });
    }

    function addAssessments(callback) {
        winston.info('Begin reading assessments file');
        fs.readFile(datasetFolderPath + 'assessments.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing assessments csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var assessments = [];

                output.forEach(function (item) {
                    var assessment = {};
                    var courseName = item[0] + item[1];
                    var courseDBObject = coursesMap[courseName];

                    assessment.name = item[2];
                    assessment.CourseId = courseDBObject.id;
                    assessment.id_IRI = "http://open-university.edu/" + courseName.toLowerCase() + "/assessment/" + item[2];
                    assessment.type = item[3];
                    assessment.weight = item[5];

                    var days = parseInt(item[4]);
                    if (!isNaN(days)) {
                        var date = new Date(coursesMap[courseName].startDate);
                        assessment.deadline = date.addDays(days);
                    }
                    assessments.push(assessment);
                });

                winston.info('Start assessments import series..');

                db.Assessment.bulkCreate(assessments, {
                    updateOnDuplicate: ['name']
                }).then(function (results) {
                    db.Assessment.findAll().then(assessmentsObjects => {
                        assessmentsObjects.forEach(assObject => {
                            assessmentMap[assObject.name] = assObject.id;
                        });
                        winston.info('All Assessment created...');
                        callback(null);
                    });
                });
            });
        });
    }

    function addUsers(callback) {
        winston.info('Begin reading users file');
        fs.readFile(datasetFolderPath + 'users.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing users csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var users = [];

                output.forEach(function (item) {
                    var user = {};

                    user.name = item[0];
                    user.username = item[0];
                    user.password = item[0];
                    user.email = item[0] + '@open-university.edu';
                    user.gender = item[1] == 'M' ? 'Male' : 'Female';
                    user.region = item[2];
                    user.highest_education = item[3];
                    user.age_band = item[4];
                    user.disability = item[5] == 'N' ? false : true;
                    user.role = 'student';
                    users.push(user);
                });

                winston.info('Start users import series..');
                db.User.bulkCreate(users, {
                    updateOnDuplicate: ['name']
                }).then(function (results) {
                    db.User.findAll().then(usersObjects => {
                        usersObjects.forEach(userObject => {
                            usersMap[userObject.name] = userObject;
                        });
                        winston.info('All Users created...');
                        callback(null);
                    });
                });
            });
        });
    }

    function addRegistered(callback) {
        winston.info('Begin reading registered students file');
        fs.readFile(datasetFolderPath + 'registered.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing registered students csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var userCourses = [];

                output.forEach(function (item) {
                    var userCourse = {};

                    var courseName = item[1] + item[0];

                    userCourse.uniqueID = courseName + item[7];

                    userCourse.User = usersMap[item[7]];
                    userCourse.Course = coursesMap[courseName];

                    var registrationDays = parseInt(item[6]);

                    if (!isNaN(registrationDays)) {
                        var registrationDate = new Date(coursesMap[courseName].startDate);
                        userCourse.enroll_date = registrationDate.addDays(registrationDays);
                    }

                    var unregistrationDays = parseInt(item[3]);
                    if (!isNaN(unregistrationDays)) {
                        var unregistrationDate = new Date(coursesMap[courseName].startDate);
                        userCourse.unenroll_date = unregistrationDate.addDays(unregistrationDays);
                    }

                    userCourse.credits = parseInt(item[5]);
                    userCourse.enroll_times = parseInt(item[4]);
                    userCourse.final_result = item[2];


                    userCourses.push(userCourse);
                });

                winston.info('Start registered students import series..');

                async.eachLimit(userCourses, maxLimit, function (userCourse, callback) {

                    var inputValues = {
                        credits: userCourse.credits,
                        enroll_times: userCourse.enroll_times,
                        final_result: userCourse.final_result
                    };

                    if (userCourse.enroll_date) {
                        inputValues.enroll_date = userCourse.enroll_date;
                    }

                    if (userCourse.unenroll_date) {
                        inputValues.unenroll_date = userCourse.unenroll_date;
                    }

                    userCourse.User.addEnroll(userCourse.Course, inputValues).then(function () {
                        winston.info('Registerd students %s created...', userCourse.uniqueID);
                        callback();
                    }).catch(function (error) {
                        winston.error('Error adding Registerd students ');
                        winston.error(error);
                        callback(error);
                    });
                }, function () {
                    winston.info('All Registerd students created...');
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

        db.Verb.bulkCreate(verbs, {
            updateOnDuplicate: ['name']
        }).then(() => {
            db.Verb.findAll({}).then(verbs => {
                verbs.forEach(verb => {
                    verbsMap[verb.id_IRI] = verb;
                });
                winston.info('All verbs added...');
                callback(null);
            });
        });
    }

    function addAssActivites(callback) {
        winston.info('Begin reading ass activity file');
        fs.readFile(datasetFolderPath + 'assActivity.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing ass activity csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var assActivities = [];

                output.forEach(function (item) {
                    var actorDBObject = usersMap[item[1]];

                    var courseDBObject = coursesMap[item[4] + item[5]];

                    var date = new Date(courseDBObject.startDate);
                    var score = parseInt(item[3]);

                    var attemptedActivity = {
                        timestamp: date.addDays(item[2]),
                        stored: date.addDays(item[2]),
                        platform: "Moodle LMS",
                        UserId: actorDBObject.id,
                        VerbId: verbsMap['https://w3id.org/xapi/adl/verbs/attempted'].id,
                        has_result: false,
                        AssessmentId: assessmentMap[item[0]],
                        CourseId: courseDBObject.id
                    };

                    var completedActivity = {
                        timestamp: date.addDays(item[2]),
                        stored: date.addDays(item[2]),
                        platform: "Moodle LMS",
                        UserId: actorDBObject.id,
                        VerbId: verbsMap['https://w3id.org/xapi/adl/verbs/completed'].id,
                        has_result: true,
                        success: (score >= 60 ? true : false),
                        raw: score,
                        min: 0,
                        max: 100,
                        AssessmentId: assessmentMap[item[0]],
                        CourseId: courseDBObject.id
                    };

                    assActivities.push({
                        activity1: attemptedActivity,
                        activity2: completedActivity
                    });
                });

                winston.info('Start assessment activities statements import series..');

                async.parallel([
                    function (callback) {
                        var attemptedActivities = assActivities.map(item => {
                            return item.activity1;
                        });

                        db.Statement.bulkCreate(attemptedActivities).then(() => {
                            winston.info('Attempted Assessments activities created...');
                            callback(null);
                        });
                    },
                    function (callback) {
                        var completedActivities = assActivities.map(item => {
                            return item.activity2;
                        });

                        db.Statement.bulkCreate(completedActivities).then(() => {
                            winston.info('Completed Assessments activities created...');
                            callback(null);
                        });

                    }
                ], function (err) {
                    callback(); // next step
                });
            });
        });
    }

    function addResourcesLunchedActivites(callback) {
        winston.info('Begin reading res lunch activity file');
        fs.readFile(datasetFolderPath + 'studentVleLunched.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing res lunch activity csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var resActivities = [];

                output.forEach(function (item) {
                    var actorDBObject = usersMap[item[2]];

                    var courseDBObject = coursesMap[item[0] + item[1]];

                    var date = new Date(courseDBObject.startDate);

                    var launchedActivity = {
                        timestamp: date.addDays(item[4]),
                        stored: date.addDays(item[4]),
                        platform: "Moodle LMS",
                        UserId: actorDBObject.id,
                        VerbId: verbsMap['https://w3id.org/xapi/adl/verbs/launched'].id,
                        has_result: false,
                        ResourceId: resourcesMap[item[3]],
                        CourseId: courseDBObject.id
                    };

                    resActivities.push(launchedActivity);
                });

                winston.info('Start resources lunched activities import series..');
                var inserter = async.cargo(function (resActivities, inserterCallback) {
                        db.Statement.bulkCreate(resActivities).then(function () {
                            winston.info('Batch of resources lunched activities created... ' + new Date().getUTCMilliseconds());
                            inserterCallback();
                        });
                    },
                    5000
                );

                resActivities.forEach(item => {
                    inserter.push(item);
                });
                callback(null);
            });
        });
    }

    function addResourcesClickedActivites(callback) {
        winston.info('Begin reading res click activity file');
        fs.readFile(datasetFolderPath + 'studentVleClicked.csv', 'utf8', function (err, data) {
            if (err) {
                winston.error(err);
                return;
            }
            winston.info('Begin parsing res click activity csv file');
            parse(data, {}, function (err, output) {
                if (err) {
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var resActivities = [];

                output.forEach(function (item) {
                    var actorDBObject = usersMap[item[2]];


                    var courseDBObject = coursesMap[item[0] + item[1]];

                    var date = new Date(courseDBObject.startDate);

                    var sumOfClicks = parseInt(item[5]);

                    for (var i = 0; i < sumOfClicks; i++) {
                        var clickedActivity = {
                            timestamp: date.addDays(item[4]),
                            stored: date.addDays(item[4]),
                            platform: "Moodle LMS",
                            UserId: actorDBObject.id,
                            VerbId: verbsMap['https://w3id.org/xapi/let/verbs/clicked'].id,
                            has_result: false,
                            ResourceId: resourcesMap[item[3]],
                            CourseId: courseDBObject.id
                        };
                        resActivities.push(clickedActivity);
                    }
                });

                winston.info('Start resources lunched activities import series..');


                var inserter = async.cargo(function (resActivities, inserterCallback) {
                        db.Statement.bulkCreate(resActivities).then(function () {
                            winston.info('Batch of resources clicks activities created... ' + new Date().getUTCMilliseconds());
                            inserterCallback();
                        });
                    },
                    5000
                );

                resActivities.forEach(item => {
                    inserter.push(item);
                });
                callback(null);
            });
        });
    }
});