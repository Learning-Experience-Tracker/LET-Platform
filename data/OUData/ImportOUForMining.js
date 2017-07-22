var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    parse = require('csv-parse'),
    moment = require('moment'),
    json2csv = require('json2csv'),
    _ = require('lodash');



Date.prototype.addDays = function (days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + parseInt(days));
    return dat;
}

sequelize.init(function (db) {

    var datasetFolderPath = 'data/OUData/AAA2013J/';

    var weeks = new Set();
    var coursesMap = new Map();
    var resourcesMap = new Map();
    var assessmentMap = new Map();
    var usersMap = new Map();
    var dateMap = new Map();

    async.series([
        function (callback) {
            seedDateTable(callback);
        },
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
        },
        function (callback) {
            addAssActivites(callback);
        },
        function (callback) {
            addResourcesClickedActivites(callback);
        }
    ], function (err) {
        if (err)
            throw err;

        var rows = [];

        var assessmentArray = [];

        Object.keys(assessmentMap).forEach(assesmentKey => {
            assessmentArray.push(assessmentMap[assesmentKey]);
        });

        _.sortBy(assessmentArray, (item) => {
            item.deadline
        });

        Object.keys(usersMap).forEach(Userkey => {

            var user = usersMap[Userkey];

            var row = {
                UserId: usersMap[user.username].id,
                CourseId: coursesMap[user.course].id,
                final_result: user.final_result,
                homepage: 0,
                content: 0,
                url: 0,
                forum: 0
            };

            _.sortBy(Array.from(weeks)).forEach(week => {

                var weekActivities = user.weeklyActivites[week];

                var weekDate = moment(coursesMap[user.course].startDate).add(week, 'weeks');

                row.DateId = dateMap[weekDate.format('MM/DD/YYYY')].id;
                row.weekNo = week;
                if (weekActivities) {
                    row.homepage += parseInt(weekActivities.homepage);
                    row.content += parseInt(weekActivities.content);
                    row.url += parseInt(weekActivities.url);
                    row.forum += parseInt(weekActivities.forum);
                }

                try {
                    assessmentArray.forEach(assessment => {
                        if (assessment.deadline > weekDate) {
                            var submit = user.assessmentsSubmits[assessment.name];
                            if (submit) {
                                row.willSubmit = true;
                                row.score = submit.score;
                            } else {
                                row.willSubmit = false;
                                row.score = 0;
                            }
                            throw BreakException;
                        }
                    });
                } catch (e) {}
                rows.push(JSON.parse(JSON.stringify(row)));
            });
        });

        var inserter = async.cargo(function (rows, inserterCallback) {
                db.MiningStatement.bulkCreate(rows).then(function () {
                    winston.info('Batch of mining clicks activities created... ' + new Date().getUTCMilliseconds());
                    inserterCallback();
                });
            },
            5000);

        rows.forEach(item => {
            inserter.push(item);
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
                            courseObject.startDate = new Date(2013, 9, 1, 3);
                            break;
                        case "2013B":
                            courseObject.startDate = new Date(2013, 1, 1, 3);
                            break;
                        case "2014J":
                            courseObject.startDate = new Date(2014, 9, 2, 3);
                            break;
                        case "2014B":
                            courseObject.startDate = new Date(2014, 1, 1, 3);
                            break;
                    }
                    var date = new Date(courseObject.startDate);
                    courseObject.endDate = date.addDays(length);
                    coursesMap[courseObject.name] = courseObject;
                });

                db.Course.findAll().then(courses => {
                    courses.forEach(course => {
                        if (coursesMap[course.name]) {
                            coursesMap[course.name].id = course.id;
                        }
                    });
                    winston.info('Done courses');
                    callback();
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
                        assessment.deadline = moment(date.addDays(days));
                    }
                    assessmentMap[assessment.name] = assessment;
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
                    user.assessmentsSubmits = new Map();
                    usersMap[user.username] = user;
                });


                db.User.findAll().then(users => {
                    users.forEach(user => {
                        if (usersMap[user.username]) {
                            usersMap[user.username].id = user.id;
                        }
                    });
                    winston.info('Done User');
                    callback();
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
                    var user = usersMap[item[1]];
                    var assessment = assessmentMap[item[0]];
                    var courseDBObject = coursesMap[item[4] + item[5]];

                    var date = new Date(courseDBObject.startDate);

                    var submitDate = date.addDays(item[2]);
                    var score = parseInt(item[3]);

                    user.assessmentsSubmits[assessment.name] = {
                        date: submitDate,
                        score: score
                    };
                });
                callback();
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


                    weeks.add(parseInt(weekNumber));

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



    function seedDateTable(callback) {
        db.Date.count({}).then(count => {
            if (count == 0) {
                var startDate = moment('2010-01-01');
                var endDate = moment('2020-01-01');

                var dates = [];
                for (var m = startDate; m.isBefore(endDate); m.add(1, 'days')) {
                    dates.push({
                        date: m.toDate(),
                        year: m.format('YYYY'),
                        month: m.format('MM'),
                        day_of_month: m.format('DD'),
                        week_of_year: m.week(),
                        day_of_week: m.format('dddd'),
                        timestamp: m.unix()
                    });
                }

                db.Date.bulkCreate(dates).then(function () {
                    winston.info("Date Table filled");
                    db.Date.findAll({
                        raw: true
                    }).then(dates => {
                        dates.forEach(date => {
                            dateMap[moment(date.date).format('MM/DD/YYYY')] = date;
                        });
                        callback();
                    });
                });
            } else {
                db.Date.findAll({
                    raw: true
                }).then(dates => {
                    dates.forEach(date => {
                        dateMap[moment(date.date).format('MM/DD/YYYY')] = date;
                    });
                    callback();
                });
            }
        });
    }
});