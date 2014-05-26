var gplusSignIn = require('../../thirdparty/google/auth');

module.exports = {
    auth: function  (req, res) {
        var tokens = req.body;

        // 服务器访问google oauth 经常抽风，遂先去掉，默认为FE
        //gplusSignIn.authAsync(req.body).then(function (user) {
        res.send(200);

        //    var accountName = _.find(user.emails, function (e) {
        //        return e.type === 'account';
        //    }).value.split('@')[0];

        req.session.authenticated = true;
        req.session.accountName = 'FE';

        User.addAsync({
            accountName: 'FE',
            displayName: 'FE'
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
