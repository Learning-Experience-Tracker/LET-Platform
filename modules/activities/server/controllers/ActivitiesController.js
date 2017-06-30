'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.get = function(req, res){
    res.end();
}

module.exports.getAll = function(req, res){
    db.Statement
      .findAll({
          where :{},
          order : [
            ['id', 'ASC']
          ],
          include : [
              {model : db.Verb},
              {model : db.User},
              {model : db.Assessment},
              {model : db.Resource},
              {model : db.Question}
        ]
      }).then(function(statements){
        return res.json(statements);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.page = function(req, res){
    db.Statement
      .findAll({
          where :{},
          order : [
                ['id', 'ASC']
          ],
          include : [
              {model : db.Verb},
              {model : db.User},
              {model : db.Assessment},
              {model : db.Resource},
              {model : db.Question}
        ],
        limit: req.body.limit,
        offset: req.body.offset,
      }).then(function(statements){
        return res.json(statements);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.getCount = function(req, res){
    db.Statement
      .findAll().then(function(statements){
        return res.json(statements.length);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}

module.exports.getAssessmentActivities = function (req,res){
    db.Statement
      .findAll({
          attributes: { exclude: ['createdAt','updatedAt','ResourceId'] },
          where :{ AssessmentId : req.params.id},
          order : [
                ['id', 'ASC']
          ],
          include : [
              {model : db.Question ,attributes: { exclude: ['createdAt','updatedAt'] }}
        ]
      }).then(function(statements){
        return res.json(statements);
    }).catch(function(err){
        winston.error(err);
        res.status(500).end();
    });
}