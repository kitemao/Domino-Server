/**
 * Session
 *
 * Sails session integration leans heavily on the great work already done by Express, but also unifies
 * Socket.io with the Connect session store. It uses Connect's cookie parser to normalize configuration
 * differences between Express and Socket.io and hooks into Sails' middleware interpreter to allow you
 * to access and auto-save to `req.session` with Socket.io the same way you would with Express.
 *
 * For more information on configuring the session, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.session = {
    secret : '8c431c4144196db1690aceb5a1bee218',
    adapter : 'mongo',
    host : 'localhost',
    port : 27017,
    db : 'sails',
    collection : 'sessions',
    username : '',
    password : ''
};
