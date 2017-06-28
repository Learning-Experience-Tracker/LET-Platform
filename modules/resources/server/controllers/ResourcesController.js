'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.create = function(req, res){
    var resource = db.Resource.build({
            id_IRI : req.body.id_IRI,
            type_IRI : req.body.type_IRI,
            name : req.body.name,
            description : req.body.description,
            CourseId : req.body.courseId
    });

    resource.save().then(function(){
        res.end();
    })
    .catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.get = function(req, res){
    res.end();
}

module.exports.getAll = function(req, res){
    db.Resource
      .findAll().then(function(resourses){
        return res.json(resourses);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.delete = function(req, res){
    db.Resource.destroy({
        where : { id : req.body.resourceId }
    }).then(function(){
        res.end();
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}