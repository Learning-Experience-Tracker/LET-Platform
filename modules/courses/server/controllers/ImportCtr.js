'use strict';

var db = require('./../../../../config/sequelize'),
    winston = require('./../../../../config/winston'),
    async = require('async'),
    parse = require('csv-parse'),
    fs = require('fs');

module.exports.import = function (req, res) {

    winston.info('recive import file');
    var importType = req.body.type;
    var filePath = req.files.file.path;

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            winston.error(err);
            return;
        }
        parse(data, (err, data) => {
            if (err) {
                winston.error(err);
                return;
            }
            switch (importType) {
                case 'students':
                    importStudent(data);
                    break;

                case 'resources':
                    importResources(data);
                    break;

                case 'assessments':
                    importAssessments(data);
                    break;
            }

            fs.unlink(filePath, function (err) {
                if (err) return console.log(err);
                winston.info('import file deleted successfully');
                res.end();
            });
        });
    });
}


function importStudent(data) {
    console.log(data);
}

function importAssessments(data) {
    console.log(data);
}

function importResources(data) {
    console.log(data);
}