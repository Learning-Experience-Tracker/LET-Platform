
var config = require('./../../../../config/config'),
    jwt = require('jsonwebtoken'),
    db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston');

module.exports.login = function(req, res){
    var payload = { id : req.user.id };
    var token = jwt.sign(payload, config.jwtSecret);

    return res.json({
                user: {
                    username : req.user.username,
                    name : req.user.name,
                    role : req.user.role
                },
                token: token
    });
}

module.exports.register = function(req, res){
    console.log(req.body);
    var user = db.User.build({
        name : req.body.name,
        username : req.body.username,
        email : req.body.email,
        password : req.body.password,
        role : req.body.role
    });

    user.save().then(function(user){
        console.log(user);
        var payload = { id : user.id };
        var token = jwt.sign(payload, config.jwtSecret);

        return res.json({
                    user: {
                        username : user.username,
                        name : user.name,
                        role : user.role
                    },
                    token: token
        });
    })
    .catch(function(error){
        winston.error(error);
        res.status(500).end();
    });
}