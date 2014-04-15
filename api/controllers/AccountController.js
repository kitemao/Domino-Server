var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = {
    auth: function  (req, res) {
        var tokens = req.body;

        gplusSignIn.authAsync(req.body).then(function (user) {
            req.session.authenticated = true;
            res.send(200);
        }, function (err) {
            res.send({
                msg: err
            }, 403);
        });
    },
    logout: function (req, res) {

    }
};
