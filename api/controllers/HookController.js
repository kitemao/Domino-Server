/*
 * hook control
 *
 * @author  miaojian(miaojian@wandoujia.com)
 * @date    2014/05/08
 */

var Q = require('q');

var StatusCode = require('../../utils/StatusCodeMapping');

module.exports = {
    update: function (req, res) {
        var data = req.body;

        console.log(data);

        Hook.update({
            title : data.title,
            projectTitle: data.projectTitle
        }, data).then(function (hook) {

            res.json({
                body: hook
            }, StatusCode.SUCCESS);
        });
    }
};
