var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = {
    auth: function  (req, res) {
        var tokens = req.body;

        // 服务器访问google oAuth 经常抽风，遂先去掉，从前端获取
        // gplusSignIn.authAsync(req.body).then(function (user) {

            // var accountName = _.find(user.emails, function (e) {
            //     return e.type === 'account';
            // }).value.split('@')[0];

        var accountName = req.body.accountName;
        var displayName = req.body.displayName;

        req.session.authenticated = true;
        req.session.accountName = accountName;

        //var displayName = user.displayName;

        res.send({
            body: {
                accountName: accountName,
                displayName: displayName
            }
        }, 200);

        User.addAsync({
            accountName: accountName,
            displayName: displayName
        });
        // }, function (err) {
        //     res.send({
        //         msg: err
        //     }, 403);
        // });
    },
    logout: function (req, res) {

    }
};
