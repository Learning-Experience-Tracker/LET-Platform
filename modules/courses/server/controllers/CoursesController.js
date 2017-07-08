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
    
    db.Course.findOne({
        where : {
            id : req.params.id
        },
        include : [{
              model : db.Resource
          },{
              model : db.Assessment
          }]
    }).then(function(course){
        if(!course){
            res.status(404).end();
            return;
        }

        res.json(course);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
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

module.exports.delete = function(req, res){
    db.Course.destroy({
        where : { id : req.body.courseId }
    }).then(function(){
        res.end();
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.getStudentCourses = function(req, res){
    db.Course.findAll({
        include : [{
            model : db.User,
            where : { Id : req.user.id },
            required : false // get all courses, even the ones the user is not rolled in
        }]
    }).then(function(courses){
        res.json(courses);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.getSpecifiedStudentCourses = function(req, res){
    db.Course.findAll({
        include : [{
            model : db.User,
            where : { Id : req.user.id },
            required : true
        }]
    }).then(function(courses){
        res.json(courses);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.enroll = function(req, res){    
    db.Course.findOne({
        where : {
            Id : req.body.courseId
        }
    }).then(function(course){
        
        return req.user.addCourse(course, { enroll_date : Date.now(), enroll_times : 1});
    }).then(function(){
        res.status(200).end();
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}