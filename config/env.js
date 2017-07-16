var path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    rootPath: rootPath,
    port: process.env.PORT || 3000,
    db: {
        name: 'let',
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
    jwtSecret: 'batman'
}