var chai = require('chai'),
    chaiHttp = require('chai-http'),
    should = chai.should(),
    db = require('../config/sequelize'),
    app = require('./prepare');


chai.use(chaiHttp);


describe('Users', () => {
    describe('/api/register', () => {
        it('it should sign up', (done) => {
            db.User.destroy({
                where: {
                    username: 'admin1'
                },
                truncate: false
            }).then(() => {
                chai.request(app)
                    .post('/api/register')
                    .send({
                        username: 'admin1',
                        password: 'admin1',
                        name: 'test',
                        email: 'test',
                        role: 'admin'
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        done();
                    });
            });
        });
    });

    describe('/api/login', () => {
        it('it should login', (done) => {
            chai.request(app)
                .post('/api/login')
                .send({
                    username: 'admin1',
                    password: 'admin1'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('token');
                    done();
                });
        });

        it('it should not login without username', (done) => {

            chai.request(app)
                .post('/api/login')
                .send({
                    password: 'sdfsdf'
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });


        it('it should not login without passowrd', (done) => {

            chai.request(app)
                .post('/api/login')
                .send({
                    username: 'fsdfsdf',
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });
});