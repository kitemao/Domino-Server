var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = {
    auth: function  (req, res) {
        var tokens = req.body;

        gplusSignIn.authAsync(req.body).then(function (user) {
            res.send(200);

            var accountName = _.find(user.emails, function (e) {
                return e.type === 'account';
            }).value.split('@')[0];

            req.session.authenticated = true;
            req.session.accountName = accountName;

            User.addAsync({
                accountName: accountName,
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
