'use strict';

var db = require('./../../../../config/sequelize');

module.exports.execute = function(req, res){
    console.log(req.body);

    var query = {};

    var whereClause = {
        VerbId : req.body.didWhat
    };

    var groupByClause = {};

    var attributesClause = ['id', 'timestamp', 'stored', 'platform', 'has_result', 'success',
                            'scaled', 'raw', 'min', 'max', 'createdAt', 'updatedAt', 'VerbId', 
                            'UserId', 'AssessmentId', 'ResourceId', 'QuestionId'];

    switch(req.body.toWhat){
        case 'resource' : 
            if(!req.body.toWhatValue){ // we should group by
                query.group = 'ResourceId';
                query.attributes = [ [db.Sequelize.fn('COUNT', 'Id'), 'count'], 'ResourceId'];
            }else
                whereClause.ResourceId = req.body.toWhatValue; 
    
            break;
        case 'question' : 
            if(!req.body.toWhatValue){ // we should group by
                query.group = 'QuestionId';
                query.attributes = [ [db.Sequelize.fn('COUNT', 'Id'), 'count'], 'QuestionId'];                
            }else
                whereClause.QuestionId = req.body.toWhatValue; 

            break;
        case 'assessment' : 
            if(!req.body.toWhatValue){ // we should group by
                query.group = 'AssessmentId';
                query.attributes = [ [db.Sequelize.fn('COUNT', 'Id'), 'count'], 'AssessmentId'];                
            }else                
                whereClause.AssessmentId = req.body.toWhatValue; 
            
            break;
    }

    query.where = whereClause;
    
    console.log(query);    

    db.Statement.findAll(query).then(function(statements){
        res.json(statements);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}