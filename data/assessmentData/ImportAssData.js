
var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async');

sequelize.init(function(db){
    
    var admin           = {};
    var oranization     = {};
    var course          = {};
    var usersMap        = new Map();
    var verbsMap        = new Map();
    var assessmentsMap  = new Map();
    var questionSMap    = new Map();

    fs.readFile('data/assessmentData/statements.json', 'utf8', function (err, data) {
        winston.info('Reading statements file.');
        if (err) throw err;
        var statements = JSON.parse(data);

        async.series([
            function(callback){
                addAdmin(callback)
            },function(callback){
                addOrganization(callback)
            },function(callback){
                addCourse(callback)
            },function(callback){
                addUsers(statements,callback);
            },function(callback){
                addVerbs(statements,callback)
            },function(callback){
                addAssessments(statements,callback)
            },function(callback){
                addQuestions(statements,callback)
            },function (callback){
                addActivities(statements,callback);
            }
        ],function(err) {
            winston.info('All objects are addeded');
        });
    });

    function addAdmin(callback){
        db.User.find({ where : { username : 'admin' } })
        .then(function(adminUser){
            if(!adminUser){ // no admin user registered
                winston.info('No admin user found, creating...');
                
                adminUser = db.User.build(adminConfigs);

                adminUser.save().then(function(newItem){
                    admin = newItem.dataValues;
                    winston.info('Admin user created.');
                    callback();               
                });

            }else{
                admin = adminUser.dataValues;
                winston.info('Admin user is already created.');
                callback(); 
            }
        })
        .catch(function(error){
            winston.error('Error with admin user...');
            winston.error(error);
            callback(error); 
        });
    }

    function addOrganization(callback){
        db.Organization.find({ where : { name : 'Oranization 1' } })
        .then(function(existOranization){
            if(!existOranization){ 
                winston.info('No Organization found, creating...');
                
                oranization = db.Organization.build({ name : 'Oranization 1' , UserId:admin.id });

                oranization.save().then(function(newItem){
                    oranization = newItem.dataValues;
                    winston.info('Organization created.');
                    callback();               
                });

            }else{
                oranization = existOranization.dataValues;
                winston.info('Organization is already created.');
                callback(); 
            }
        })
        .catch(function(error){
            winston.error('Error with Organization ...');
            winston.error(error);
            callback(error); 
        }); 
    }

    function addCourse(callback){
        db.Course.find({ where : { name : 'cop-3223' } })
        .then(function(existCourse){
            if(!existCourse){ 
                winston.info('No Course found, creating...');
    
                course = db.Course.build({ name : 'cop-3223' , startDate: new Date() , OrganizationId : oranization.id });
                
                course.save().then(function(newItem){
                    course = newItem.dataValues;
                    winston.info('Course created.');
                    callback();               
                });

            }else{
                course = existCourse.dataValues;
                winston.info('Course is already created.');
                callback(); 
            }
        })
        .catch(function(error){
            winston.error('Error with Course ...');
            winston.error(error);
            callback(error); 
        }); 
    }

    function addUsers(statements,callback){
        winston.info('Start users import series...');
        async.eachSeries(statements,function(item,callback){

            var firstName =  item.actor.name.split(" ")[0].toLowerCase();
            var userObject = {
                name : item.actor.name,
                email : item.actor.mbox,
                username :  firstName,
                password : firstName
            };

            db.User.find({ where : { email : userObject.email} })
                .then(function(user){
                    if(!user){
                        winston.info('No user found with email ' + userObject.email);
                        user = db.User.build(userObject);
                        user.save().then(function(newItem){
                            winston.info('User Created');
                            usersMap[newItem.dataValues.email] = newItem.dataValues;
                            callback(); // process next statement
                        });

                    }else{
                        winston.info('User is already created with email ' + userObject.email);
                        usersMap[user.dataValues.email] = user.dataValues;
                        callback(); // process next statement
                    }
                })
                .catch(function(error){
                    winston.error('Error adding user');
                    winston.error(error);
                    callback(error);
                });
        },function(){
            winston.info('All users added...');
            callback(null);
        });
    } 

    function addVerbs(statements,callback){
        winston.info('Start verbs import series...');
        async.eachSeries(statements,function(item,callback){

            var verbObject = {
                name : item.verb.display['en-US'],
                id_IRI : item.verb.id
            };

            db.Verb.find({ where : { id_IRI : verbObject.id_IRI} })
                .then(function(verb){
                    if(!verb){
                        winston.info('No verb found with ' + verbObject.id_IRI);
                        verb = db.Verb.build(verbObject);
                        verb.save().then(function(newItem){
                            winston.info('Verb Created');
                            verbsMap[newItem.dataValues.id_IRI] = newItem.dataValues;
                            callback();  // process next statement    
                        }); 

                    }else{
                        winston.info('Verb is already created ' + verbObject.id_IRI);
                        verbsMap[verb.dataValues.id_IRI] = verb.dataValues;                                               
                        callback(); // process next statement
                    }
                })
                .catch(function(error){
                    winston.error('Error adding verb');
                    winston.error(error);
                    callback(error);
                });
        },function(){
            winston.info('All verbs added...');
            callback(null);
        });
    }

    function addAssessments(statements,callback){
        winston.info('Start Assessments import series...');
        async.eachSeries(statements,function(item,callback){

            var verbObject = {
                name : item.verb.display['en-US'],
                id_IRI : item.verb.id
            };

            if (verbObject.name != "attempted"){
                winston.info('Next Statement');
                callback();
                return;
            }

            var assesmentObject = {
                name : item.object.definition.name['en-US'],
                id_IRI : item.object.id,
                CourseId : course.id
            };
            
            db.Assessment.find({ where : { id_IRI : assesmentObject.id_IRI} })
                .then(function(assessment){
                    if(!assessment){
                        winston.info('No assessment found with ' + assesmentObject.id_IRI);
                        assessment = db.Assessment.build(assesmentObject);
                        assessment.save().then(function(newItem){
                            winston.info('Assessment Created');
                            assessmentsMap[newItem.dataValues.id_IRI] = newItem.dataValues;
                            callback();  // process next statement    
                        });

                    }else{
                        winston.info('Assessment is already created ' + assesmentObject.id_IRI);
                        assessmentsMap[assessment.dataValues.id_IRI] = assessment.dataValues;                                               
                        callback(); // process next statement
                    }
                })
                .catch(function(error){
                    winston.error('Error adding assessment');
                    winston.error(error);
                    callback(error);
                });
        },function(){
            winston.info('All assessments added...');
            callback(null);
        });
    }

    function addQuestions(statements,callback){
        winston.info('Start Questions import series...');
        async.eachSeries(statements,function(item,callback){

            var verbObject = {
                name : item.verb.display['en-US'],
                id_IRI : item.verb.id
            };

            if (verbObject.name != "answered"){
                winston.info('Next Statement');
                callback();
                return;
            }

            var assessmentID = item.context.contextActivities.parent[0].id;

            var assessmenctObject = assessmentsMap[assessmentID];

            var questionObject = {
                name : item.object.definition.name['en-US'],
                id_IRI : item.object.id,
                AssessmentId : assessmenctObject.id
            };

            
            db.Question.find({ where : { id_IRI : questionObject.id_IRI} })
                .then(function(question){
                    if(!question){
                        winston.info('No question found with ' + questionObject.id_IRI);
                        question = db.Question.build(questionObject);
                        question.save().then(function(newItem){
                            winston.info('Question Created');
                            questionSMap[newItem.dataValues.id_IRI] = newItem.dataValues;
                            callback();   // process next statement   
                        });
                    }else{
                        winston.info('Questions is already created ' + questionObject.id_IRI);
                        questionSMap[question.dataValues.id_IRI] = question.dataValues;                                               
                        callback(); // process next statement
                    }
                })
                .catch(function(error){
                    winston.error('Error adding question');
                    winston.error(error);
                    callback(error);
                });
        },function(){
            winston.info('All questions added...');
            callback(null);
        });
    }

    function addActivities(statements,callback){
        winston.info('Start activities import series...');
        async.eachSeries(statements,function(item,callback){

            var verbObject = {
                name : item.verb.display['en-US'],
                id_IRI : item.verb.id
            };

            var actorDBObject   = usersMap[item.actor.mbox];
            var verbDBObject    = verbsMap[verbObject.id_IRI];

            var statementObject = {
                timestamp : Date.parse(item.timestamp),
                stored : Date.parse(item.stored),
                platform : "Moodle LMS",
                UserId : actorDBObject.id,
                VerbId : verbDBObject.id
            };


            if (verbObject.name == "answered"){
                statementObject.has_result = true;
                statementObject.success = item.result.success;

                var questionDB  = questionSMap[item.object.id];
                var asessmentDB = assessmentsMap[item.context.contextActivities.parent[0].id];
                statementObject.AssessmentId = asessmentDB.id;
                statementObject.QuestionId = questionDB.id;
            }

            if (verbObject.name == "completed"){
                statementObject.has_result = true;
                statementObject.success = item.result.success;
                statementObject.raw = item.result.score.raw;
                statementObject.min = item.result.score.min;
                statementObject.max = item.result.score.max;

                var objectDB  = assessmentsMap[item.object.id];
                statementObject.AssessmentId = objectDB.id;
            }
        
            if (verbObject.name == "attempted"){
                statementObject.has_result = false;

                var objectDB  = assessmentsMap[item.object.id];
                statementObject.AssessmentId = objectDB.id;
            }

            var statement = db.Statement.build(statementObject);
            statement.save().then(function(newItem){
                winston.info('Added new activity record');
                callback(); // process next statement
            });

        },function(){
            winston.info('All activities added...');
            callback(null);
        });
    }
});

