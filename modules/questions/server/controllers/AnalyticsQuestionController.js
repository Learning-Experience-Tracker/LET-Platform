'use strict';

var db = require('./../../../../config/sequelize');

module.exports.execute = function(req, res){
    console.log(req.body);

    var whereClause = {
        VerbId : req.body.didWhat
    };

    switch(req.body.toWhat){
        case 'resource' : whereClause.ResourceId = req.body.toWhatValue; break;
        case 'question' : whereClause.QuestionId = req.body.toWhatValue; break;
        case 'assessment' : whereClause.AssessmentId = req.body.toWhatValue; break;
    }

    db.Statement.findAll({
        where : whereClause
    }).then(function(statements){
        res.json(statements);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}