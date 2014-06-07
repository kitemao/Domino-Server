var gplusSignIn = require('../../thirdparty/google/auth');
var msgMapping = require('../../utils/MsgMapping');

module.exports = function (req, res, next) {
    console.log('session test');

    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    if (req.session.authenticated) {
        return next();
    } else {
        return res.send({
            msg: msgMapping.NO_LOGIN
        }, 403);
    }
};
