'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.create = function(req, res){
    var lrs = db.LRS.build({
        name : req.body.name,
        username : req.user.name,
        password : req.user.password,
        UserId : req.user.id
    });

    lrs.save().then(function(){
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
    db.LRS.findAll({ where : { UserId : req.user.id } }).then(function(lrss){
        return res.json(lrss);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}