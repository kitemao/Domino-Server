var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = function (req, res, next) {
    if (req.session.authenticated) {
        return next();
    } else {
        var tokens = {
            /* jshint -W106 */
            // TODO: Add neccesary keys
            expires_in : 0
        };//req.cookies.tokens;

        gplusSignIn.authAsync(tokens).then(function () {
            res.session.authenticated = true;
            next();
        }, function () {
            res.send(403);
        });
    }
};
