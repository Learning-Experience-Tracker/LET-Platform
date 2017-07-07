
var sequelize = require('../../config/sequelize'),
    winston = require('../../config/winston'),
    adminConfigs = require('../../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    parse = require('csv-parse');

sequelize.init(function(db){

    var datasetFolderPath   = 'data/OUData/'
    var currnetDataSetPath  = 'AAA2013J';
    
    var admin           = {};
    var oranization     = {};

    var coursesMap      = new Map();
    var resourcesMap    = new Map();


    async.series([
            function(callback){
                addAdmin(callback)
            },function(callback){
                addOrganization(callback);
            },function(callback){
                addCourse(callback)
            },function(callback){
                addResources(callback);
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

                    Date.prototype.addDays = function(days) {
                        var dat = new Date(this.valueOf());
                        dat.setDate(dat.getDate() + parseInt(days));
                        return dat;
                    }

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
                async.eachLimit(courses,50,function(courseObject,callback){
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
        fs.readFile(datasetFolderPath + 'vle.csv','utf8',function(err,data){
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

                async.eachLimit(resources,50,function(resObject,callback){

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
});

