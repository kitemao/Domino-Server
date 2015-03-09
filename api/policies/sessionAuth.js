var gplusSignIn = require('../../thirdparty/google/auth');
var msgMapping = require('../../utils/MsgMapping');
var sso = require('wdj_sso_node');

module.exports = function (req, res, next) {
    console.log('session test');

    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    if (req.session.authenticated && req.session.user) {
        return next();
    }

    sso.getUserByCookies(req.cookies).then(function (user) {
        req.session.authenticated = true;
        req.session.user = user;
        next();
    }, function () {
        return res.send({
            msg: msgMapping.NO_LOGIN
        }, 401);
    });
};
