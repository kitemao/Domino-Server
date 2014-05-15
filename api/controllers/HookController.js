/*
 * hook control
 *
 * @author  miaojian(miaojian@wandoujia.com)
 * @date    2014/05/08
 */

var Q = require('q');

var StatusCode = require('../../utils/StatusCodeMapping');

var WandouLabs = require('../../thirdparty/wandoulabs/wandoulabs');

module.exports = {
    update: function (req, res) {
        var data = req.body;

        console.log(data);

        Hook.update({
            title : data.title,
            projectTitle: data.projectTitle
        }, data).then(function (hook) {

            // 更新xml
            Project.findOne({
                title: data.projectTitle
            }).then(function (project) {
                project.script = data.script;

                var taskName;
                if (data.title === 'Build Staging') {
                    taskName = 'deploy-staging';
                }
                else {
                    taskName = 'deploy-production';
                }

                WandouLabs.updateBuildingScriptAsync(project, taskName).then(function () {
                    res.json({
                        body: hook
                    }, StatusCode.SUCCESS);
                });
            });
        });
    }
};
