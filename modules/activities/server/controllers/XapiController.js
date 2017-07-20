'use strict';

var db = require('./../../../../config/sequelize'),
    env = require('./../../../../config/env'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    request = require('request');

var options = {
    method: 'post',
    json: true, 
    url:  env.LRS.endpoint + 'statements',
    headers: {
        'Authorization': "Basic " + new Buffer(env.LRS.username + ":" + env.LRS.password).toString("base64"),
        'Content-Type': 'application/json',
        'X-Experience-API-Version': '1.0.0'
    }
}

module.exports.statements = function (req, res) {
    options.body = req.body;
    request(options,(error, response, body) => {
        console.log(body)        
    });
    res.end();
}