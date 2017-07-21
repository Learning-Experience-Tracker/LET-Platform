'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    parse = require('csv-parse'),
    fs = require('fs');

module.exports.import = function (req, res) {

    winston.info('recive import file');

    var courseID = req.params.id;
    var importType = req.body.type;
    var filePath = req.files.file.path;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            winston.error(err);
            return;
        }
        parse(data, (err, data) => {
            if (err) {
                winston.error(err);
                return;
            }

            db.Course.findOne({
                where: {
                    id: req.params.id
                }
            }).then(function (course) {
                switch (importType) {
                    case 'students':
                        importStudent(course, data);
                        break;

                    case 'resources':
                        importResources(course, data);
                        break;

                    case 'assessments':
                        importAssessments(course, data);
                        break;

                    case 'questions':
                        importQuesions(course, data);                        
                    break;
                }

                fs.unlink(filePath, function (err) {
                    if (err) return console.log(err);
                    winston.info('import file deleted successfully');
                    res.end();
                });
            });
        });
    });
}

function importStudent(course, data) {
    data.shift(); // remove first row (headers)

    var users = [];

    data.forEach(function (item) {
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
            userObject.addEnroll(course, {
                enroll_date: Date.now(),
                enroll_times: 1
            }).then(function () {
                callback();

            });
        });
    }, function () {
        winston.info('All users added...');
    });
}

function importAssessments(course, data) {
    data.shift(); // remove first row (headers)

    var assessments = [];

    data.forEach(function (item) {
        var assessment = {};
        assessment.id_IRI = item[0];
        assessment.name = item[1];
        assessment.CourseId = course.id;
        assessments.push(assessment);
    });

    db.Assessment.bulkCreate(assessments, {
        updateOnDuplicate: ['name']
    }).then(function () {
        winston.info("assessments added");
    });
}

function importResources(course, data) {
    data.shift(); // remove first row (headers)

    var resources = [];

    data.forEach(function (item) {
        var resource = {};
        resource.id_IRI = item[0];
        resource.type = item[1];
        resource.name = item[2];
        resource.platform = item[3];
        resource.CourseId = course.id;
        resources.push(resource);
    });

    db.Resource.bulkCreate(resources, {
        updateOnDuplicate: ['name']
    }).then(function () {
        winston.info("resources added");
    });
}

function importQuesions(course, data) {
    data.shift(); // remove first row (headers)

    var questions = [];

    async.eachSeries(data, (item, callback) => {

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
        });
    }));
}