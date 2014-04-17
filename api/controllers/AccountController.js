var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = {
    auth: function  (req, res) {
        var tokens = req.body;

        gplusSignIn.authAsync(req.body).then(function (user) {
            res.send(200);

            req.session.authenticated = true;

            User.addAsync({
                accountName: _.find(user.emails, function (e) {
                    return e.type === 'account';
                }).value.split('@')[0],
                displayName: user.displayName
            });
        }, function (err) {
            res.send({
                msg: err
            }, 403);
        });
    },
    logout: function (req, res) {

    }
};
