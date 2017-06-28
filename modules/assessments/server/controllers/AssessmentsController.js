'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

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