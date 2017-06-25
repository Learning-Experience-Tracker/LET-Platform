'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.create = function(req, res){
    var course = db.Course.build({
        name : req.body.name,
        OrganizationId : req.body.orgId
    });

    course.save().then(function(){
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
    db.Course
      .findAll({ 
          include : [{
              model : db.Organization,
              where : { UserId : req.user.id }
          }]
    }).then(function(courses){
        return res.json(courses);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}