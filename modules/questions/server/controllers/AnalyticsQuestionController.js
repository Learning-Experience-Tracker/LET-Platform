'use strict';

var db = require('./../../../../config/sequelize'),
    _ = require('lodash'),
    winston = require('./../../../../config/winston');

module.exports.execute = function(req, res){
    console.log(req.body);

    var query = {
        raw : true
    };

    var whereClause = {
        VerbId : req.body.didWhat
    };

    var groupByClause = {};

    var attributesClause = ['id', 'timestamp', 'stored', 'platform', 'has_result', 'success',
                            'scaled', 'raw', 'min', 'max', 'createdAt', 'updatedAt', 'VerbId', 
                            'UserId', 'AssessmentId', 'ResourceId', 'QuestionId'];


    //ToWhat Builder:
    switch(req.body.toWhat){
        case 'resource' :    
            whereClause.AssessmentId = null; //count resource concerned statements only
                 
            if(!req.body.toWhatValue){ // we should group by
                query.group = 'ResourceId';
                query.attributes = [ [db.Sequelize.fn('COUNT', 'Id'), 'count'], ['ResourceId', 'QueriedId']];
                query.include = [{ model : db.Resource , plain : true }];
            }else{
                whereClause.ResourceId = req.body.toWhatValue;
            }

            break;
        case 'question' : 
            whereClause.AssessmentId = { //count question concerned statements only
                $ne : null
            };

            if(!req.body.toWhatValue){ // we should group by
                query.group = 'QuestionId';
                query.attributes = [ [db.Sequelize.fn('COUNT', 'Id'), 'count'], ['QuestionId', 'QueriedId']];                
                query.include = [{ model : db.Question , plain : true }];
            }else
                whereClause.QuestionId = req.body.toWhatValue; 

            break;
        case 'assessment' : 
            whereClause.ResourceId = null;//count assessment concerned statements only

            if(!req.body.toWhatValue){ // we should group by
                query.group = 'AssessmentId';
                query.attributes = [ [db.Sequelize.fn('COUNT', 'Id'), 'count'], ['AssessmentId', 'QueriedId']];                
                query.include = [{ model : db.Assessment , plain : true }];
            }else                
                whereClause.AssessmentId = req.body.toWhatValue; 
            
            break;
    }


    //Who Builder:
    if(req.body.who)
        whereClause.UserId = req.body.who;


    //When Builder:
    if(req.body.when)
        whereClause.timestamp = db.Sequelize.where(db.Sequelize.fn('date_format', db.Sequelize.col('timestamp'), '%d-%m-%Y'), req.body.when);

    query.where = whereClause;
    
    console.log(query);    

    db.Statement.findAll(query).then(function(statements){
        console.log(statements[0]);
        if(req.body.apply && req.body.apply != 'none'){ // we have an aggregation function rather than count
            var data = statements,
                result = {};
            console.log(data);
            if(req.body.apply == 'min')
                result = _.minBy(data, function(object){ return object.count; });
            else
                result = _.maxBy(data, function(object){ return object.count; });

            console.log(result);
            res.json(result);
        }else
            res.json(statements);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.getAllQuestions = function(req, res){
    db.AnalyticsQuestion.findAll().then(function(questions){
        res.json(questions);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.get = function(req, res){
    console.log(req.params.id);

    db.AnalyticsQuestion.findOne({
        where : {
            Id : req.params.id
        }, include : {
            model : db.Indicator
        }
    }).then(function(question){
        res.json(question);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.save = function(req, res){
    db.AnalyticsQuestion.build({
        name : req.body.name
    }).save().then(function(question){
        return db.Indicator.build({
            name : '',
            hql : JSON.stringify(req.body.hql),
            AnalyticsQuestionId : question.id
        }).save();
    }).then(function(){
        res.end();
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}