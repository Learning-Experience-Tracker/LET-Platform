'use strict';

var db = require('./../../../../config/mongoose'),
    winston = require('./../../../../config/winston');

module.exports.create = function(req, res){
    var lrs = new db.LRS({
        name : req.body.name,
        username : req.user.name,
        password : req.user.password,
        userId : req.user.id
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
    db.LRS.find({ userId : req.user.id }).then(function(lrss){
        return res.json(lrss);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}