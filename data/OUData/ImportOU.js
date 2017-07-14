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

    var datasetFolderPath = 'data/OUData/AAA2014J/'
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
            //addResourcesLunchedActivites(callback);
            callback();  
        },
        function (callback) {
            //addResourcesClickedActivites(callback);
            callback();  
        },
        function (callback) {
            //addAssActivites(callback);
            callback();  
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
                            courseObject.startDate = new Date(2013, 9, 2);
                            break;
                        case "2013B":
                            courseObject.startDate = new Date(2013, 1, 2);
                            break;
                        case "2014J":
                            courseObject.startDate = new Date(2014, 9, 2);
                            break;
                        case "2014B":
                            courseObject.startDate = new Date(2014, 1, 2);
                            break;
                    }
                    var date = new Date(courseObject.startDate);
                    courseObject.endDate = date.addDays(length);
                    courses.push(courseObject);
                });

                winston.info('Start courses import series..');
                async.eachLimit(courses, maxLimit, function (courseObject, callback) {
                    var course = db.Course.build({
                        name: courseObject.name,
                        startDate: courseObject.startDate,
                        endDate: courseObject.endDate,
                        OrganizationId: oranization.id,
                        id_IRI : "http://open-university.edu/" + courseObject.name.toLowerCase()
                    });
                    course.save().then(function (newItem) {
                        coursesMap[courseObject.name] = newItem;
                        winston.info('Course %s created...', courseObject.name);
                        callback();
                    });
                }, function () {
                    winston.info('All courses created...');
                    callback(null);
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

                    res.name = item[0];
                    res.courseName = item[2] + item[1];
                    res.id_IRI = "http://open-university.edu/" + res.courseName.toLowerCase() + "/resources/" + item[0];
                    res.type = item[3];

                    resources.push(res);
                });

                winston.info('Start resources import series..');

                async.eachLimit(resources, maxLimit, function (resObject, callback) {

                    var courseDBObject = coursesMap[resObject.courseName];

                    var res = db.Resource.build({
                        name: resObject.name,
                        id_IRI: resObject.id_IRI,
                        type: resObject.type,
                        CourseId: courseDBObject.id
                    });

                    res.save().then(function (newItem) {
                        resourcesMap[resObject.name] = newItem.dataValues;
                        winston.info('Resource %s created...', resObject.name);
                        callback();
                    });

                }, function () {
                    winston.info('All resources created...');
                    callback(null);
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

                    assessment.name = item[2];
                    assessment.courseName = item[0] + item[1];
                    assessment.id_IRI = "http://open-university.edu/" + assessment.courseName.toLowerCase() + "/assessment/" + item[2];
                    assessment.type = item[3];
                    assessment.weight = item[5];

                    var days = parseInt(item[4]);
                    if (!isNaN(days)) {
                        var date = new Date(coursesMap[assessment.courseName].startDate);
                        assessment.deadline = date.addDays(days);
                    }
                    assessments.push(assessment);
                });

                winston.info('Start assessments import series..');

                async.eachLimit(assessments, maxLimit, function (assessmentObject, callback) {

                    var courseDBObject = coursesMap[assessmentObject.courseName];

                    var inputValues = {
                        name: assessmentObject.name,
                        id_IRI: assessmentObject.id_IRI,
                        type: assessmentObject.type,
                        CourseId: courseDBObject.id,
                        weight: assessmentObject.weight
                    };

                    if (assessmentObject.deadline) {
                        inputValues.deadline = assessmentObject.deadline;
                    }

                    var assessment = db.Assessment.build(inputValues);

                    assessment.save().then(function (newItem) {
                        assessmentMap[assessmentObject.name] = newItem.dataValues;
                        winston.info('Assessment %s created...', assessmentObject.name);
                        callback();
                    });

                }, function () {
                    winston.info('All Assessment created...');
                    callback(null);
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

                async.eachLimit(users, maxLimit, function (userObject, callback) {

                    var user = db.User.build(userObject);



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
                                    usersMap[userObject.name] = newItem;
                                    winston.info('User %s created...', userObject.name);
                                    callback();
                                });

                            } else {
                                winston.info('User is already created with email ' + userObject.email);
                                usersMap[user.name] = user;
                                callback(); // process next statement
                            }
                        })
                        .catch(function (error) {
                            winston.error('Error adding user');
                            winston.error(error);
                            callback(error);
                        });

                }, function () {
                    winston.info('All Users created...');
                    callback(null);
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

                    userCourse.User.addCourse(userCourse.Course, inputValues).then(function () {
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
                    var assessmentDBObject = assessmentMap[item[0]];

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
                        AssessmentId: assessmentDBObject.id
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
                        AssessmentId: assessmentDBObject.id
                    };

                    assActivities.push({
                        activity1: attemptedActivity,
                        activity2: completedActivity
                    });
                });

                winston.info('Start assessment activities statements import series..');
                // each object will add two statement (completed and attempted)
                async.eachLimit(assActivities, maxLimit, function (assActivityObject, callback) {

                    async.parallel([
                        function (callback) {
                            var statement = db.Statement.build(assActivityObject.activity1);

                            statement.save().then(function (newItem) {
                                winston.info('Assessment activity statement %s created...', assActivityObject.activity1.timestamp);
                                callback(); // next statement          
                            });
                        },
                        function (callback) {
                            var statement = db.Statement.build(assActivityObject.activity2);

                            statement.save().then(function (newItem) {
                                winston.info('Assessment activity statement %s created...', assActivityObject.activity2.timestamp);
                                callback(); // next statement          
                            });

                        }
                    ], function (err) {
                        callback();
                    });
                }, function () {
                    winston.info('All Assessment activities statements created...');
                    callback(null);
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
                    var resourcesDBObject = resourcesMap[item[3]];

                    var courseDBObject = coursesMap[item[0] + item[1]];

                    var date = new Date(courseDBObject.startDate);

                    var launchedActivity = {
                        timestamp: date.addDays(item[4]),
                        stored: date.addDays(item[4]),
                        platform: "Moodle LMS",
                        UserId: actorDBObject.id,
                        VerbId: verbsMap['https://w3id.org/xapi/adl/verbs/launched'].id,
                        has_result: false,
                        ResourceId: resourcesDBObject.id
                    };

                    resActivities.push(launchedActivity);
                });

                winston.info('Start resources lunched activities import series..');

                async.eachLimit(resActivities, maxLimit, function (launchedActivityObject, callback) {

                    var statement = db.Statement.build(launchedActivityObject);
                    statement.save().then(function (newItem) {
                        winston.info('Resource launch activity %s created...', launchedActivityObject.timestamp);
                        callback();
                    });

                }, function () {
                    winston.info('All resource lunched activities created...');
                    callback(null);
                });
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
                    var resourcesDBObject = resourcesMap[item[3]];

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
                            ResourceId: resourcesDBObject.id
                        };
                        resActivities.push(clickedActivity);
                    }
                });

                winston.info('Start resources lunched activities import series..');

                async.eachLimit(resActivities, maxLimit, function (launchedActivityObject, callback) {

                    var statement = db.Statement.build(launchedActivityObject);
                    statement.save().then(function (newItem) {
                        winston.info('Resource launch activity %s created...', launchedActivityObject.timestamp);
                        callback();
                    });

                }, function () {
                    winston.info('All resource lunched activities created...');
                    callback(null);
                });
            });
        });
    }
});