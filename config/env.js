var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    rootPath: rootPath,
    port: process.env.PORT || 3000,
    db: {
        name: process.env.NODE_ENV == 'test' ? 'testDB' : 'let',
        username: 'root',
        password: '',
        host: 'localhost',
        port: 3306,
        dialect: 'mysql',
        enableLogging: false,
        connectionLimit: 50,
        queueLimit: 0,
        waitForConnection: true
    },
    mongoDb: {
        name: 'let',
        host: 'mongodb://localhost/'
    },
    adminConfigs: {
        name: 'admin',
        email: 'admin@mail.com',
        username: 'admin',
        password: 'admin',
        role: 'admin'
    },
    jwtSecret: 'batman',
    LRS:{
        endpoint : 'http://localhost:8081/learninglocker/public/data/xAPI/',
        username : 'd957d2a2d007ebb0528051f90992c9a1cf32c3f9',
        password : '21b1af92cf37672c5d4f116fd9757c8166df8a7c'
    }
}