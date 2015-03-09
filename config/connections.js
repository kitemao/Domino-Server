var config = require('../OathKeeper/frontend/mysql-domino.json');
module.exports.connections = {
    mongo : {
        adapter : 'sails-mongo',
        host : '127.0.0.1',
        port : 27017,
        user : '',
        password : '',
        database : 'Domino'
    },
    someMysqlServer: {
        adapter: 'sails-mysql',
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database
    },
    disk: {
        adapter: 'sails-disk'
    }
};




