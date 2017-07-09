'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.create = function (req, res) {
    var org = db.Organization.build({
        name: req.body.name,
        UserId: req.user.id
    });

    org.save().then(function () {
            res.end();
        })
        .catch(function (err) {
            winston.error(err);
            res.status(500).end();
        });
}

module.exports.get = function (req, res) {
    res.end();
}

module.exports.getAll = function (req, res) {
    db.Organization.findAll({
        where: {
            UserId: req.user.id
        },include:[
            {model : db.Course}
        ]
    }).then(function (orgs) {
        return res.json(orgs);
    }).catch(function (err) {
        winston.error(err);
        res.status(500).end();
    });
}