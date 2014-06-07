/**
 *  has publish auth?
 *
 *  @author miaojian(miaojian@wandoujia.com)
 *  @date  2014/05/29
 */
var _          = require('underscore');
var permission = require('../../permission/publish');
var msgMapping = require('../../utils/MsgMapping');

module.exports = function (req, res, next) {

    var env         = process.env.NODE_ENV || 'development';
    var accountName = req.session.accountName;

    var list        = permission[env];


    if (list && _.contains(list, accountName)) {

        console.log('list succ:', accountName);
        return next();
    }
    else {
        console.log('list error:', accountName);
        res.send({
            msg: msgMapping.NO_PUBLISH_AUTH
        }, 403);
    }
};
