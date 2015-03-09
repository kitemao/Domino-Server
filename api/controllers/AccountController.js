var authCfg    = require('../../permission/auth');
var StatusCode = require('../../utils/StatusCodeMapping');
var Msg        = require('../../utils/MsgMapping');

module.exports = {
    auth: function  (req, res) {
        var user = req.session.user;

        if (!user) {
            return res.send({
                msg: Msg.NO_LOGIN,
                target: 'account auth'
            }, 500);
        }

        var accountName = user.id;
        var displayName = user.name;

        req.session.accountName = user.id;

        // 处理用户的权限
        var userAuth = {};
        _.each(authCfg, function (auth, authKey) {
            auth = _.isArray(auth) ?  auth : auth[process.env.NODE_ENV];

            if (_.contains(auth, accountName)) {
                userAuth[authKey] = true;
            }
        });

        var body = _.extend({
            accountName: accountName,
            displayName: displayName,
            auth: userAuth
        }, user);

        res.send({
            body: body
        }, 200);

        User.addAsync({
            accountName: accountName,
            displayName: displayName
        });

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
