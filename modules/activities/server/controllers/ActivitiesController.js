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

module.exports.getVerbs = function(req, res){
    db.Verb.findAll().then(function(verbs){
        res.json(verbs);
    }).catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}

module.exports.create = function (req,res){
    console.log(JSON.stringify(req.body, null, 2));
    console.log("-----------------------------");
    res.end();
}