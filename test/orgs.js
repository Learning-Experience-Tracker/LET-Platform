var chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    db = require('../config/sequelize'),
    app = require('./prepare'),
    async = require('async'),
    request = require('request');

// Allows the middleware to think we're already authenticated.
app.request.isAuthenticated = function () {
    return true;
}

chai.use(chaiHttp);


describe('Orgs', function () {
    var token;
    before(function (done) {
        chai.request(app)
            .post('/api/login')
            .send({
                username: 'admin',
                password: 'admin'
            })
            .end((err, res) => {
                token = res.body.token;
                token = 'JWT ' + token;
                done();
            });
    });

    var orgID;
    describe('/api/org/create', () => {
        it('it should create org', (done) => {
            chai.request(app)
                .post('/api/org/create')
                .set('Authorization', token)
                .send({
                    name: 'Org'
                })
                .end((err, res) => {
                    res.body.should.to.be.an('number');
                    res.should.have.status(200);
                    orgID = res.body;
                    done();
                });
        });
    });

    describe('/api/org/all', () => {
        it('it should get all orgs', (done) => {
            chai.request(app)
                .get('/api/org/all')
                .set('Authorization', token)
                .end((err, res) => {
                    res.body.should.be.an('array');
                    res.should.have.status(200);
                    done();
                });
        });
    });


    describe('/api/org/:id', () => {
        it('it should get an org', (done) => {
            chai.request(app)
                .get('/api/org/' + orgID)
                .set('Authorization', token)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    res.body.should.have.property('id');
                    res.body.should.have.property('name');
                    res.body.should.have.property('UserId');
                    res.should.have.status(200);
                    done();
                });
        });
    });


    describe('/api/org/:id/dashboard', () => {
        it('it should get an org dashboard data', (done) => {
            chai.request(app)
                .get('/api/org/' + orgID + "/dashboard")
                .set('Authorization', token)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    res.should.have.status(200);
                    done();
                });
        });
    });

});