'use strict';
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var config = require('./config');
var db = require('./mongoose');
var winston = require('./winston');

//---Json Web Tokens
var PassportJwt = require('passport-jwt');
var jwt = require('jsonwebtoken');
var JwtStrategy = PassportJwt.Strategy;
var ExtractJwt = PassportJwt.ExtractJwt;

//Serialize sessions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.User.find({where: {id: id}})
    .then(function(user){
        if(!user) return done('error');
        winston.info('Session: { id: ' + user.id + ', username: ' + user.username + ' }');
        done(null, user);
    }).catch(function(err){
        done(err, null);
    });

});

//Use Jwt Strategy
passport.use(new JwtStrategy({
     jwtFromRequest : ExtractJwt.fromAuthHeader(),
     secretOrKey : config.jwtSecret
   },function(jwt_payload, next){
       winston.info("Payload received: ");
       winston.info(jwt_payload);
       db.User.findById(jwt_payload.id).then(function(user) {
            winston.info("JWT user:" + user);      
            if (!user) {
                next(null, false, { message: 'Unknown user' });
            } else {
                winston.info('Login (JWT) : { id: ' + user.id + ', username: ' + user.username + ' }');
                next(null, user);
            }
        }).catch(function(err){
            next(err);
        });

   }));


//Use local strategy
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    db.User.findOne({ username: username }).then(function(user) {
      if (!user) {
        done(null, false, { message: 'Unknown user' });
      } else if (!user.authenticate(password)) {
        done(null, false, { message: 'Invalid password'});
      } else {
        winston.info('Login (local) : { id: ' + user.id + ', username: ' + user.username + ' }');
        done(null, user);
      }
    }).catch(function(err){
      done(err);
    });
  }
));

module.exports = passport;
