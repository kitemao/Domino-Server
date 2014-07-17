/**
 * 与当前业务有关
 */
var _          = require('underscore');
var sails      = require('sails');

var cronService = {

    registerAllCron: function () {

        var Crontab = sails.services.crontab;

        Cron.find().then(function (crons) {
            crons.forEach(function (cron) {

                cronService.creatCronTab(cron);
            });
        }, function (err) {
            console.log(err);
        });
    },

    creatCronTab: function (cronData) {
        var data  = cronData;
        var hooks = data.hooks;
        var start = data.status === '0' ? true : false;
        var cronName  = data.projectTitle + '-' + data.title;

        var Crontab      = sails.services.crontab;
        var TriggerHook  = sails.services.triggerhook;


        // 如果没有创建则创建
        var jobCfg = Crontab.getJobCfg(cronName);
        if (!jobCfg) {
            Crontab.create({
                name: cronName,
                time: data.time,
                start: start
            });
        }

        // 添加和创建ticks
        var handlers = [ function () {
            // 更新次数
            Cron.findOne({
                projectTitle: data.projectTitle,
                title : data.title
            }).then(function (cron) {

                var times = cron.times;
                cron.times = parseInt(times, 10) + 1;

                cron.save();
            });
        } ];
        _.each(hooks, function (hook) {
            var hookArr    = hook.split('|');
            var hookName   = hookArr[0];
            var hookParams = hookArr[1] ? hookArr[1].split('&') : [];

            handlers.push(function () {
                TriggerHook({
                    title : hookName,
                    params: {
                        projectTitle: data.projectTitle,
                        operator: 'cronTab',
                        branch: _.find(hookParams, function (param) {
                            return param && (param.split('=')[0] === 'branch');
                        }).split('=')[1]
                    }
                });
            });
        });
        Crontab.addTicks(cronName, handlers, true);

        // 更新time
        Crontab.setTime(cronName, data.time);
    },

    updateCronTab: function (cronData) {

        cronService.creatCronTab(cronData);
    }
};

module.exports = cronService;

