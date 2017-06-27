'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.get = function(req, res){
    res.end();
}

module.exports.getAll = function(req, res){
    db.Statement
      .findAll().then(function(statements){
        return res.json(statements);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}