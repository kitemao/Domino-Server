/**
 *
 *  @author miaojian(miaojian@wandoujia.com)
 */
var _          = require('underscore');
var auth       = require('../../permission/auth');
var msgMapping = require('../../utils/MsgMapping');

module.exports = function (req, res, next) {

    var accountName = req.session.accountName;

    var superList   = auth.super;

    // 超级管理员，权限最大
    if (superList && _.contains(superList, accountName)) {

        return next();
    }
    else {
        var projectTitle = req.params.projectTitle;

        Project.findOne({
            title: projectTitle
        }).then(function (data) {

            var managers = data.managers;

            if (_.contains(managers, accountName)) {

                console.log(accountName, '有操作权限');
                return next();
            }
            else {
                res.send({
                    msg: msgMapping.NO_OPERATE_AUTH
                }, 403);
            }
        }, function (err) {
            console.log(err);
        });
    }
};
