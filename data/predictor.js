var sequelize = require('../config/sequelize'),
    winston = require('../config/winston'),
    adminConfigs = require('../config/env').adminConfigs,
    fs = require('fs'),
    async = require('async'),
    moment = require('moment'),
    ml = require('machine_learning'),
    KNN = require('ml-knn');



sequelize.init(function (db) {

    db.MiningStatement.findAll({
        where: {
            DateId: '1531',
            UserId: {
                $ne: '41'
            }
        },
        raw: true
    }).then(data => {

        var input = [];

        var result1 = [];

        var result2 = [];

        var result3 = [];

        data.forEach(item => {
            if (item.final_result == 'Fail' || item.final_result == 'Withdrawn')
                result1.push(0);
            else
                result1.push(1);

            if (item.willSubmit)
                result2.push(1);
            else
                result2.push(0);

            result3.push(item.score);

            input.push([parseInt(item.homepage), parseInt(item.content), parseInt(item.url), parseInt(item.forum)]);
        });


        var knn = new ml.KNN({
            data: input,
            result: result3
        });

        var y = knn.predict({
            x: [369, 719, 73, 291],
            k: 1
        });

        console.log(y);

        var cluster = ml.kmeans.cluster({
            data: data,
            k: 4,
            epochs: 100
        });
    });
});