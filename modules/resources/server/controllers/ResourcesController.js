'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.create = function(req, res){
    var resource = db.Resource.build({
            id_IRI : req.body.id_IRI,
            name : req.body.name,
            type : req.body.type,
            CourseId : req.body.courseId,
    });

    resource.save().then(function(){
        res.end();
    })
    .catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
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


module.exports.get = function(req, res){
    db.Resource.findOne({
        where : {
            id : req.params.id
        }
    }).then(function(resource){
        if(!resource){
            res.status(404).end();
            return;
        }
        res.json(resource);
    }).catch(function(error){
        winston.error(error);
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

module.exports.getTypes = function(req, res){
    var resourceTypes = db.Resource.rawAttributes.type.values;
    if (resourceTypes != null){
        return res.json(resourceTypes);
    }else{
        winston.error(err);
        res.status(500).end();
    }
}


module.exports.getAssessmentDashboard = function(req, res){
    res.status(500).end();
}
