'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    math = require('mathjs');

module.exports.create = function(req, res){
    var assessment = db.Assessment.build({
        name : req.body.name,
        id_IRI : req.body.id_IRI,
        CourseId : req.body.courseId
    });

    assessment.save().then(function(newItem){
        var newAssessmentID = newItem.dataValues.id;
        if (req.body.questions){
            var questions = new Array();
            req.body.questions.forEach(function(item){
                questions.push({AssesmentId:newAssessmentID, name:item.name, id_IRI:item.id_IRI});
            });
            var bulk = [];
            questions.forEach(function(item){
                bulk.push(
                    db.Question.create({
                        name : item.name,
                        id_IRI : item.id_IRI,
                        AssessmentId : item.AssesmentId
                    })
                );
            });
             Promise.all(bulk)
                .then(function(){
                           res.end();
                });
        }else{
            res.end();
        }
    })
    .catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.get = function(req, res){
    db.Assessment.findOne({
        where : {
            id : req.params.id
        },
        include : [{
            model : db.Question
        }]
    }).then(function(assessment){
        if(!assessment){
            res.status(404).end();
            return;
        }

        res.json(assessment);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.getAll = function(req, res){
    db.Assessment
      .findAll({ 
          include : []
    }).then(function(courses){
        return res.json(courses);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.delete = function(req, res){
    db.Assessment.destroy({
        where : { id : req.body.assessmentId }
    }).then(function(){
        res.end();
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}


module.exports.getAssessmentDashboard = function (req,res){
    async.parallel({
        statements: function(callback) { // activities in this assessment 
                db.Statement
                .findAll({
                    attributes: { exclude: ['createdAt','updatedAt','ResourceId'] },
                    where :{ AssessmentId : req.params.id},
                    order : [
                            ['id', 'ASC']
                    ],
                    include : [
                        {model : db.Question ,attributes: { exclude: ['createdAt','updatedAt','ResourceId'] }},
                        {model : db.Verb , attributes: { exclude: ['createdAt','updatedAt','ResourceId'] }},
                        {model : db.User,  attributes: { exclude: ['createdAt','updatedAt','ResourceId'] }}
                    ],
                    raw : true,
                    nest: true
                }).then(function(statements){
                    callback(null,statements);
                }).catch(function(err){
                    callback(err,null);
                });
        },
        questionsNum: function(callback) { // questions number in assessment 
                db.Question
                .count({
                    where :{ AssessmentId : req.params.id}
                }).then(function(res){
                    callback(null,res);
                }).catch(function(err){
                    callback(err,null);
                });
        },
        avg: function(callback) { // Avarage
                db.Statement
                .findOne({
                    attributes: [ [db.sequelize.fn('AVG', db.sequelize.col('raw')), 'avg']],
                    where :{ AssessmentId : req.params.id},
                    raw : true 
                }).then(function(res){
                    callback(null,res.avg);
                }).catch(function(err){
                    callback(err,null);
                });
        },
        std : function (callback){ // Standard Deviation
                db.Statement
                .findAll({
                    attributes: ['raw'],
                    where :{ AssessmentId : req.params.id},
                    include : [
                        {   
                            model : db.Verb , 
                            where :{ name : 'completed' },
                            attributes: []
                        }
                    ],
                    raw :true
                }).then(function(marks){
                    var marksArray = marks.map(function(item){ return item.raw;});
                    callback(null,math.std(marksArray));
                }).catch(function(err){
                    callback(err,null);
                });
        },
        studentsNum: function(callback) { // Total attempted students
                db.Statement
                .count({
                    where :{ AssessmentId : req.params.id},
                    include : [
                        {   model : db.Verb , 
                            where :{ name : 'attempted' },
                            attributes: { exclude: ['createdAt','updatedAt'] }}
                    ]
                }).then(function(res){
                    callback(null,res);
                }).catch(function(err){
                    callback(err,null);
                });
        },
        passedstudentsNum: function(callback) { // Total passed Students
                db.Statement
                .count({
                    where :{ AssessmentId : req.params.id , success : true},
                    include : [
                        {   model : db.Verb , 
                            where :{ name : 'completed' },
                            attributes: { exclude: ['createdAt','updatedAt'] }}
                    ]
                }).then(function(res){
                    callback(null,res);
                }).catch(function(err){
                    callback(err,null);
                });
        },
        faildSutdentsNum: function(callback) { // Total faild Students
                db.Statement
                .count({
                    where :{ AssessmentId : req.params.id , success : false},
                    include : [
                        {   model : db.Verb , 
                            where :{ name : 'completed' },
                            attributes: { exclude: ['createdAt','updatedAt'] }}
                    ]
                }).then(function(res){
                    callback(null,res);
                }).catch(function(err){
                    callback(err,null);
                });
        },
        correctQuestions : function(callback){
                db.Statement
                .findAll({
                    attributes: [ [db.sequelize.fn('COUNT', db.sequelize.col('Statement.id')), 'faildSutdentsNum']],
                    where :{ AssessmentId : req.params.id , success : false},
                    include : [
                        { model : db.Question },
                        {   
                            model : db.Verb , 
                            where :{ name : 'answered' },
                            attributes: []
                        }
                    ],
                    group : 'QuestionId',
                    raw : true,
                    nest: true
                }).then(function(statements){
                    callback(null,statements);
                }).catch(function(err){
                    callback(err,null);
                });       
        }
    }, function(err, results) {
        if (err){
            winston.error(err);
            res.status(500).end();
        }else{
            return res.json(results);
        }
    });
}

module.exports.getAllAssessmentsQuestions = function(req, res){
    db.Question.findAll().then(function(questions){
        res.json(questions);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}