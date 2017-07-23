var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    parse = require('csv-parse'),
    moment = require('moment')
json2csv = require('json2csv');


Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + parseInt(days));
    return dat;
}

sequelize.init(function (db) {

    var datasetFolderPath = 'data/OUData/AAA2014J/';

    var coursesMap = new Map();
    var resourcesMap = new Map();
    var assessmentMap = new Map();
    var usersMap = new Map();

    async.series([
        function (callback) {
            addCourse(callback);
        },
        function (callback) {
            addResources(callback);
        },
        function (callback) {
            addAssessments(callback);
        },
        function (callback) {
            addUsers(callback);
        },
        function (callback) {
            addRegistered(callback);
            //callback();
        },
        function (callback) {
            addResourcesClickedActivites(callback);
        },
        function (callback) {
            // addAssActivites(callback);
            callback();
        }
    ], function (err) {
        if (err)
            throw err;

        var users = [];
        
        Object.keys(usersMap).forEach(function (key) {
            var user = usersMap[key];
            Object.keys(user.weeklyActivites).forEach(function (key) { // each week i need to create new user with week activities
                var weekActivities = user.weeklyActivites[key];

                var newUser = {
                    id: user.username,
                    gender: user.gender,
                    region: user.region,
                    age_band : user.age_band,
                    disability: user.disability,
                    course: user.course,
                    final_result: user.final_result
                };

                newUser.weekNo = key;

                newUser.homepage = weekActivities.homepage;
                newUser.content = weekActivities.content;
                newUser.url = weekActivities.url;
                newUser.glossary = weekActivities.glossary;
                newUser.wiki = weekActivities.wiki;
                newUser.quiz = weekActivities.quiz;
                newUser.forum = weekActivities.forum;

                users.push(newUser);
            });
        });

        var fields = [
            'id',
            'gender',
            'region',
            'highest_education',
            'age_band',
            'disability',
            'course',
            'final_result',
            'weekNo',
            'homepage',
            'content',
            'url',
            'quiz',
            'glossary',
            'forum',
            'wiki'
        ];

        var csv = json2csv({
            data: users,
            fields: fields
        });
        fs.writeFile(datasetFolderPath+'MiningFile.csv', csv, function (err) {
            if (err) throw err;
            console.log('Mining File saved');
        });
    });

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
                    coursesMap[courseObject.name] = courseObject;
                });
                winston.info('Done courses');
                callback();
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

                output.forEach(function (item) {
                    var res = {};

                    res.name = item[0];
                    res.courseName = item[2] + item[1];
                    res.type = item[3];

                    resourcesMap[res.name] = res;
                });

                winston.info('Done Resource');
                callback();
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

                output.forEach(function (item) {
                    var assessment = {};

                    assessment.name = item[2];
                    assessment.courseName = item[0] + item[1];
                    assessment.id_IRI = "http://www.open-university.edu/" + assessment.courseName + "/assessment/" + item[2];
                    assessment.type = item[3];
                    assessment.weight = item[5];

                    var days = parseInt(item[4]);
                    if (!isNaN(days)) {
                        var date = new Date(coursesMap[assessment.courseName].startDate);
                        assessment.deadline = date.addDays(days);
                    }
                    assessmentMap[assessment.id_IRI] = assessment;
                });

                winston.info('Done Assessments');
                callback();
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

                    user.weeklyActivites = new Map();
                    usersMap[user.username] = user;
                });

                winston.info('Done User');
                callback();
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


                    usersMap[userCourse.User.username].course = courseName;
                    usersMap[userCourse.User.username].final_result = userCourse.final_result;
                });

                winston.info('Done Reg Users');
                callback();
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

                output.forEach(function (item) {
                    var actorDBObject = usersMap[item[1]];
                    var assessmentDBObject = assessmentMap[item[0]];

                    var courseDBObject = coursesMap[item[4] + item[5]];

                    var date = new Date(courseDBObject.startDate);
                    var score = parseInt(item[3]);

                });

                winston.info('Done assessments');
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
                    var user = usersMap[item[2]];
                    var resource = resourcesMap[item[3]];

                    var courseDBObject = coursesMap[item[0] + item[1]];

                    var date = new Date(courseDBObject.startDate);

                    var sumOfClicks = parseInt(item[5]);

                    var momentDate = moment(date);

                    var clickedDate = date.addDays(item[4]);
                    var clickedMomentDate = moment(clickedDate);

                    var weekNumber = clickedMomentDate.diff(momentDate, 'weeks');

                    if (!user.weeklyActivites[weekNumber]) {
                        user.weeklyActivites[weekNumber] = {
                            'homepage': 0,
                            'content': 0,
                            'url': 0,
                            'forum': 0,
                            'quiz': 0,
                            'glossary': 0,
                            'wiki': 0
                        };
                    }

                    user.weeklyActivites[weekNumber][resource.type] += sumOfClicks;
                });
                winston.info('Done Clicks');
                callback();
            });
        });
    }
});