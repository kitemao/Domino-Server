var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = function (req, res, next) {
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    if (req.session.authenticated) {
        return next();
    } else {
        return res.send(403);
    }
};
