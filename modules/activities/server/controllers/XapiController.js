'use strict';

var db = require('./../../../../config/sequelize'),
    env = require('./../../../../config/env'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    request = require('request');

var options = {
    method: 'post',
    json: true,
    url: env.LRS.endpoint + 'statements',
    headers: {
        'Authorization': "Basic " + new Buffer(env.LRS.username + ":" + env.LRS.password).toString("base64"),
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.0'
    }
}

module.exports.statements = function (req, res) {
    var rawStatement;
    if (req.body instanceof Array){
        rawStatement = req.body[0]; 
    }else{
        rawStatement = req.body;
    }
    var verbObject = rawStatement.verb;
    var actorObject = rawStatement.actor;
    var objectObject = rawStatement.object;

    objectObject.extensions = null;


    console.log(JSON.stringify(verbObject, null, 2));
    console.log("--------------------------------------------------------");
    console.log(JSON.stringify(actorObject, null, 2));
    console.log("--------------------------------------------------------");
    console.log(JSON.stringify(objectObject, null, 2));
    console.log("--------------------------------------------------------");

    /*options.body = req.body;
    request(options, (error, response, body) => {
        console.log(body)
    });*/

    res.end();
}