var chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    sequelize = require('../config/sequelize'),
    express = require('express');

chai.use(chaiHttp);

sequelize.init(function (db) {
    bootstrap();

    var app = express();
    require('../config/express')(app);

    app.listen(config.port);
    winston.info("App started and running on port: " + config.port);


    describe('Org', () => {

    });
});