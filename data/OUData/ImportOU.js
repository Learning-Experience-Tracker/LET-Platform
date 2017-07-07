
var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    parse = require('csv-parse');


Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + parseInt(days));
    return dat;
}

sequelize.init(function(db){

    var datasetFolderPath   = 'data/OUData/'
    var maxLimit        = 100; // max insert operation in parallel
    var admin           = {};
    var oranization     = {};

    var coursesMap      = new Map();
    var resourcesMap    = new Map();
    var assessmentMap   = new Map();
    var usersMap        = new Map();
    var verbsMap        = new Map();
    var courseStudentMap = new Map();

    async.series([
            function(callback){
                addAdmin(callback)
                //callback();                
            },function(callback){
                addOrganization(callback);
               // callback();                
            },function(callback){
                addCourse(callback)
                //callback();                
            },function(callback){
                //addResources(callback);
                callback();
            },function (callback){
                addAssessments(callback);
                //callback();
            },function(callback){
                addUsers(callback);
                //callback();
            }, function (callback){
                addVerbs(callback);
            }, function(callback){
                addRegistered(callback);
            }, function(callback){
                addAssActivites(callback);
            }
        ],function(err) {
            winston.info('All objects are created...');
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
        db.Organization.find({ where : { name : 'OU Oranization' } })
        .then(function(existOranization){
            if(!existOranization){ 
                winston.info('No Organization found, creating...');
                
                oranization = db.Organization.build({ name : 'OU Oranization' , UserId:admin.id });

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
        winston.info('Begin reading courses file');
        fs.readFile(datasetFolderPath + 'courses.csv','utf8',function(err,data){
            if (err){
                winston.error(err);
                return;
            }
            winston.info('Begin parsing courses csv file');
            parse(data,{},function(err,output){
                if (err){
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var courses = [];

                output.forEach(function(item){
                    var name    = item[0];
                    var date    = item[1];
                    var length  = item[2];

                    var courseObject = { name:name+date};

                    switch(date){
                         case "2013J":
                            courseObject.startDate = new Date(2013, 9, 2);
                         break;
                         case  "2013B":
                            courseObject.startDate = new Date(2013, 1, 2);
                         break;
                         case "2014J":
                            courseObject.startDate = new Date(2014, 9, 2);
                         break;
                         case "2014B":
                            courseObject.startDate = new Date(2014, 1, 2);       
                         break;
                    }
                    var date     = new Date(courseObject.startDate);
                    courseObject.endDate = date.addDays(length);
                    courses.push(courseObject);
                });

                winston.info('Start courses import series..');
                async.eachLimit(courses,maxLimit,function(courseObject,callback){
                    var course = db.Course.build({ 
                                name : courseObject.name , 
                                startDate: courseObject.startDate ,
                                endDate: courseObject.endDate, 
                                OrganizationId : oranization.id });
                    course.save().then(function(newItem){
                        coursesMap[courseObject.name] = newItem.dataValues;
                        winston.info('Course %s created...',courseObject.name);
                        callback();               
                    });
                },function(){
                    winston.info('All courses created...');
                    callback(null);
                });
            });
        });
    }

    function addResources(callback){
        winston.info('Begin reading resources file');
        fs.readFile(datasetFolderPath + 'resrouces.csv','utf8',function(err,data){
            if (err){
                winston.error(err);
                return;
            }
            winston.info('Begin parsing resources csv file');
            parse(data,{},function(err,output){
                if (err){
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var resources = [];

                output.forEach(function(item){
                    var res = {};

                    res.name          = item[0];
                    res.courseName    = item[2] + item[1];
                    res.id_IRI        = "http://www.open-university.edu/"+res.courseName+"/resources/"+item[0];
                    res.type          = item[3];
                    
                    resources.push(res);
                });

                winston.info('Start resources import series..');

                async.eachLimit(resources,maxLimit,function(resObject,callback){

                    var courseDBObject = coursesMap[resObject.courseName];

                    var res = db.Resource.build({ 
                                name : resObject.name , 
                                id_IRI: resObject.id_IRI ,
                                type: resObject.type, 
                                CourseId : courseDBObject.id });
                    
                    res.save().then(function(newItem){
                        resourcesMap[resObject.name] = newItem.dataValues;
                        winston.info('Resource %s created...',resObject.name);
                        callback();               
                    });

                },function(){
                    winston.info('All resources created...');
                    callback(null);
                });
            });
        });
    }

    function addAssessments(callback){
        winston.info('Begin reading assessments file');
        fs.readFile(datasetFolderPath + 'assessments.csv','utf8',function(err,data){
            if (err){
                winston.error(err);
                return;
            }
            winston.info('Begin parsing assessments csv file');
            parse(data,{},function(err,output){
                if (err){
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var assessments = [];

                output.forEach(function(item){
                    var assessment    = {};

                    assessment.name          = item[2];
                    assessment.courseName    = item[0] + item[1];
                    assessment.id_IRI        = "http://www.open-university.edu/"+assessment.courseName+"/assessment/"+item[2];
                    assessment.type          = item[3];
                    assessment.weight        = item[5];

                    var days = parseInt(item[4]);
                    if (!isNaN(days)){
                        var date = new Date(coursesMap[assessment.courseName].startDate);
                        assessment.deadline = date.addDays(days);
                    }
                    assessments.push(assessment);
                });

                winston.info('Start assessments import series..');

                async.eachLimit(assessments,maxLimit,function(assessmentObject,callback){

                    var courseDBObject = coursesMap[assessmentObject.courseName];

                    var inputValues = { 
                                name : assessmentObject.name , 
                                id_IRI: assessmentObject.id_IRI ,
                                type: assessmentObject.type, 
                                CourseId : courseDBObject.id,
                                weight : assessmentObject.weight};

                    if (assessmentObject.deadline){
                        inputValues.deadline = assessmentObject.deadline;
                    }

                    var assessment = db.Assessment.build(inputValues);
                    
                    assessment.save().then(function(newItem){
                        assessmentMap[assessmentObject.name] = newItem.dataValues;
                        winston.info('Assessment %s created...',assessmentObject.name);
                        callback();               
                    });

                },function(){
                    winston.info('All Assessment created...');
                    callback(null);
                });
            });
        });
    }

    function addUsers(callback){
       winston.info('Begin reading users file');
        fs.readFile(datasetFolderPath + 'users.csv','utf8',function(err,data){
            if (err){
                winston.error(err);
                return;
            }
            winston.info('Begin parsing users csv file');
            parse(data,{},function(err,output){
                if (err){
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var users = [];

                output.forEach(function(item){
                    var user    = {};

                    user.name               = item[0];
                    user.username           = item[0];
                    user.password           = item[0];
                    user.email              = item[0] + '@open-university.edu';                    
                    user.gender             = item[1] == 'M' ? 'Male' : 'Female';
                    user.region             = item[2];
                    user.highest_education  = item[3];
                    user.age_band           = item[4];
                    user.disability         = item[5] == 'N' ? false : true;
  

                    users.push(user);
                });

                winston.info('Start users import series..');

                async.eachLimit(users,maxLimit,function(userObject,callback){

                    var user = db.User.build(userObject);
                    
                    user.save().then(function(newItem){
                        usersMap[userObject.name] = newItem.dataValues;
                        winston.info('User %s created...',userObject.name);
                        callback();               
                    });

                },function(){
                    winston.info('All Users created...');
                    callback(null);
                });
            });
        });
    }

    function addRegistered(callback){
       winston.info('Begin reading registered students file');
        fs.readFile(datasetFolderPath + 'registered.csv','utf8',function(err,data){
            if (err){
                winston.error(err);
                return;
            }
            winston.info('Begin parsing registered students csv file');
            parse(data,{},function(err,output){
                if (err){
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var courseStudents = [];

                output.forEach(function(item){
                    var courseStudent    = {};

                    var courseName = item[1]+item[0];
                    courseStudent.uniqueID = courseName + item[7];
                    courseStudent.UserId = usersMap[item[7]].id;
                    courseStudent.CourseId = coursesMap[courseName].id;
                    
                    var registrationDays = parseInt(item[6]);
                    if (!isNaN(registrationDays)){
                        var registrationDate = new Date(coursesMap[courseName].startDate);
                        courseStudent.reg_date = registrationDate.addDays(registrationDays);
                    }

                    var unregistrationDays = parseInt(item[3]);
                    if (!isNaN(unregistrationDays)){
                        var unregistrationDate = new Date(coursesMap[courseName].startDate);
                        courseStudent.un_reg_date = unregistrationDate.addDays(unregistrationDays);
                    }

                    courseStudent.credits = parseInt(item[5]);
                    courseStudent.num_attempts = parseInt(item[4]);
                    courseStudent.final_result = item[2];
                    

                    courseStudents.push(courseStudent);
                });

                winston.info('Start registered students import series..');


                async.eachLimit(courseStudents,maxLimit,function(courseStudentObject,callback){

                    var inputValues = {
                        credits : courseStudentObject.credits,
                        num_attempts : courseStudentObject.num_attempts,
                        final_result : courseStudentObject.final_result,
                        UserId : courseStudentObject.UserId,
                        CourseId : courseStudentObject.CourseId
                    };

                    if (courseStudentObject.un_reg_date){
                        inputValues.un_reg_date = courseStudentObject.un_reg_date;
                    }

                    if (courseStudentObject.reg_date){
                        inputValues.reg_date = courseStudentObject.reg_date;
                    }

                    var courseStudent = db.CourseStudent.build(inputValues);
                    courseStudent.save().then(function(newItem){
                        courseStudentMap[courseStudentObject.uniqueID] = newItem.dataValues;
                        winston.info('Course Student %s created...',courseStudentObject.uniqueID);
                        callback();               
                    });

                },function(){
                    winston.info('All Course Students created...');
                    callback(null);
                });
            });
        });  
    }

    function addVerbs(callback){
        
        var verbs =  [{
            name : 'answered',
            id_IRI : 'https://w3id.org/xapi/adl/verbs/answered'
        },{
            name : 'attempted',
            id_IRI : 'https://w3id.org/xapi/adl/verbs/attempted'
        },{
            name : 'completed',
            id_IRI : 'https://w3id.org/xapi/adl/verbs/completed'
        },{
            name : 'completed',
            id_IRI : 'https://w3id.org/xapi/let/verbs/clicked' 
        },{
            name : 'loggedin',
            id_IRI : 'https://w3id.org/xapi/adl/verbs/logged-in' 
        },{
            name : 'commented',
            id_IRI : 'https://w3id.org/xapi/adl/verbs/commented' 
        }];

        winston.info('Start verbs import series...');

        async.eachSeries(verbs,function(verbObject,callback){
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

    function addAssActivites(callback){
        winston.info('Begin reading ass activity file');
        fs.readFile(datasetFolderPath + 'assActivity.csv','utf8',function(err,data){
            if (err){
                winston.error(err);
                return;
            }
            winston.info('Begin parsing ass activity csv file');
            parse(data,{},function(err,output){
                if (err){
                    winston.error(err);
                    return;
                }

                output.shift(); // remove first row (headers)

                var assActivities = [];

                output.forEach(function(item){
                    var actorDBObject   = usersMap[item[1]];
                    var assessmentDBObject = assessmentMap[item[0]];
                    
                    var courseDBObject = coursesMap[item[4]+item[5]];

                    var date     = new Date(courseDBObject.startDate);
                    var score = parseInt(item[3]);

                    var attemptedActivity = {
                        timestamp : date.addDays(item[2]),
                        stored :  date.addDays(item[2]),
                        platform : "Moodle LMS",
                        UserId : actorDBObject.id,
                        VerbId : verbsMap['https://w3id.org/xapi/adl/verbs/attempted'].id,
                        has_result : false,
                        AssessmentId : assessmentDBObject.id
                    };

                    var completedActivity = {
                        timestamp : date.addDays(item[2]),
                        stored :  date.addDays(item[2]),
                        platform : "Moodle LMS",
                        UserId : actorDBObject.id,
                        VerbId : verbsMap['https://w3id.org/xapi/adl/verbs/completed'].id,
                        has_result : true,
                        success : (score >= 60 ? true : false),
                        raw : score,
                        min : 0,
                        max : 100,
                        AssessmentId : assessmentDBObject.id
                    };

                    assActivities.push({activity1:attemptedActivity,activity2:completedActivity});
                });

                winston.info('Start assessment activities statements import series..');
                // each object will add two statement (completed and attempted)
                async.eachLimit(assActivities,maxLimit,function(assActivityObject,callback){ 

                    async.parallel([
                        function(callback){
                            var statement = db.Statement.build(assActivityObject.activity1);

                            statement.save().then(function(newItem){
                                winston.info('Assessment activity statement %s created...',assActivityObject.activity1.timestamp);
                                callback();  // next statement          
                            });
                        },
                        function(callback){
                            var statement = db.Statement.build(assActivityObject.activity2);

                            statement.save().then(function(newItem){
                                winston.info('Assessment activity statement %s created...',assActivityObject.activity2.timestamp);
                                callback();  // next statement          
                            });

                    }],function(err){
                        callback();
                    });
                },function(){
                    winston.info('All Assessment activities statements created...');
                    callback(null);
                });
            });
        });      
    }
});

