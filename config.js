var rc = require('rc');

var config;

switch (process.env.NODE_ENV) {
case 'test':
    config = rc('dominotest');
    break;
case 'development':
    config = rc('dominodev');
    break;
case 'production':
    config = rc('dominoprod');
    break;
}

module.exports = config || {};
