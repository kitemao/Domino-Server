var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = {
    auth : function  (req, res) {
        var tokens = req.body;

        gplusSignIn.authAsync(req.body).then(function () {
            res.session.authenticated = true;
            res.send(200);
        }, function () {
            res.send(403);
        });
    },
    logout : function (req, res) {

    }
};
