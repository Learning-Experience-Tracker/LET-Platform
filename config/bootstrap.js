var db = require('./sequelize'),
    adminConfigs = require('./env').adminConfigs,
    winston = require('./winston'),
    async = require('async');

module.exports = function () {

    //bootstraping with admin user
    db.User.find({
            where: {
                username: 'admin'
            }
        })
        .then(function (adminUser) {
            if (!adminUser) { // no admin user registered
                winston.info('No admin user found, creating...');

                adminUser = db.User.build(adminConfigs);

                adminUser.save().then(function () {
                    winston.info('Admin user created.');
                });

            } else
                winston.info('Admin user is already created.');
        })
        .catch(function (error) {
            winston.error('Error bootstraping with admin user...');
            winston.error(error);
        });


    var verbs = [{
        name: 'answered',
        id_IRI: 'https://w3id.org/xapi/adl/verbs/answered'
    }, {
        name: 'attempted',
        id_IRI: 'https://w3id.org/xapi/adl/verbs/attempted'
    }, {
        name: 'completed',
        id_IRI: 'https://w3id.org/xapi/adl/verbs/completed'
    }, {
        name: 'clicked',
        id_IRI: 'https://w3id.org/xapi/let/verbs/clicked'
    }, {
        name: 'loggedin',
        id_IRI: 'https://w3id.org/xapi/adl/verbs/logged-in'
    }, {
        name: 'commented',
        id_IRI: 'https://w3id.org/xapi/adl/verbs/commented'
    }, {
        name: 'launched',
        id_IRI: 'https://w3id.org/xapi/adl/verbs/launched'
    }];

    winston.info('Start verbs import series...');

    async.eachSeries(verbs, function (verbObject, callback) {
        db.Verb.find({
                where: {
                    id_IRI: verbObject.id_IRI
                }
            })
            .then(function (verb) {
                if (!verb) {
                    winston.info('No verb found with ' + verbObject.id_IRI);
                    verb = db.Verb.build(verbObject);
                    verb.save().then(function (newItem) {
                        winston.info('Verb Created');
                        callback(); // process next statement    
                    });

                } else {
                    winston.info('Verb is already created ' + verbObject.id_IRI);
                    callback(); // process next statement
                }
            })
            .catch(function (error) {
                winston.error('Error adding verb');
                winston.error(error);
            });
    }, function () {
        winston.info('All verbs added...');
    });
}