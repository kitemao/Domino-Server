var gplusSignIn = require('../../thirdparty/google/auth');
var authCfg     = require('../../permission/auth');
var _           = require('underscore');

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

        // 处理用户的权限
        var userAuth = {};
        _.each(authCfg, function (auth, authKey) {

            auth = _.isArray(auth) ?  auth : auth[process.env.NODE_ENV];

            if (_.contains(auth, accountName)) {

                userAuth[authKey] = true;
            }
        });

        res.send({
            body: {
                accountName: accountName,
                displayName: displayName,
                auth: userAuth
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

    find: function (req, res) {
        console.log('account.find');
        var name = req.param.accountName;
        if (name) {
            if (name === req.session.accountName) {
                User.findOne({ accountName: name }).then(function (userData) {
                    if (userData) {
                        res.send({
                            body: userData
                        }, 200);
                    }
                    // todo: no user
                });
            }
        }
        else {
            User.find().then(function (userDatas) {
                if (userDatas) {
                    res.send({
                        body: userDatas
                    }, 200);
                }
            });
        }
    }
};
