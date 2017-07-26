var chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    db = require('../config/sequelize'),
    app = require('./prepare'),
    async = require('async'),
    request = require('request');

chai.use(chaiHttp);


describe('Courses', function () {
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

    var courseID;
    describe('/api/course/create', () => {
        it('it should create Course', (done) => {
            db.Organization.save({
                name: 'org'
            }).then(newItem => {
                chai.request(app)
                    .post('/api/course/create')
                    .set('Authorization', token)
                    .send({
                        name: 'Course',
                        OrganizationId: newItem.id
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        courseID = res.body;
                        done();
                    });
            });
        });
    });

    describe('/api/course/all', () => {
        it('it should get all courses', (done) => {
            chai.request(app)
                .get('/api/course/all')
                .set('Authorization', token)
                .end((err, res) => {
                    res.body.should.be.an('array');
                    res.should.have.status(200);
                    done();
                });
        });
    });


    describe('/api/course/:id', () => {
        it('it should get an course', (done) => {
            chai.request(app)
                .get('/api/course/' + courseID)
                .set('Authorization', token)
                .end((err, res) => {
                    res.body.should.be.an('object');
                    res.body.should.have.property('id');
                    res.body.should.have.property('name');
                    res.body.should.have.property('OrganizationId');
                    res.should.have.status(200);
                    done();
                });
        });
    });
});