var Q       = require('q');
var _       = require('underscore');
var CronJob = require('cron').CronJob;


var jobMap = {};

module.exports = {
    create: function (options) {

        if (!options || !options.name) {
            return;
        }

        var name    = options.name;
        var time    = options.time;
        var hooks   = options.hooks;
        var onTick  = options.onTick;
        var context = options.context || this;
        var start   = options.start || false;

        var job = new CronJob({
            cronTime: time,
            onTick: function () {

                console.log('crontab trigger', name, new Date());

                var jobItem = jobMap[name];
                var ticks   = jobItem.ticks;

                _.each(ticks, function (tick) {

                    tick.call(context);
                });
            },
            start: start
            //timeZone: "America/Los_Angeles"
        });

        jobMap[name] = {
            time : time,
            job  : job,
            ticks: onTick ? [ onTick ] : []
        };

        console.log('add one cronTab success:', name, time, 'start:', start);
        return job;
    },

    toggle: function (name, isopen) {
        var jobItem = jobMap[name];

        if (jobItem) {

            console.log('cronTab toggle:', isopen, name, new Date(), jobItem.time);
            jobItem.job[isopen ? 'start' : 'stop']();

        }
    },

    getJobCfg: function (name) {
        return jobMap[name];
    },

    addTicks: function (name, handlers, isCover) {
        var jobItem = jobMap[name];

        if (jobItem) {

            handlers = _.isArray(handlers) ? handlers : [handlers];

            if (isCover) {

                jobItem.ticks = handlers;
            }
            else {

                jobItem.ticks = jobItem.ticks.concat(handlers);
            }
        }
    },

    setTime: function (name, time) {
        var jobItem = jobMap[name];

        if (jobItem && (jobItem.time !== time)) {

            jobItem.time = time;
            jobItem.job.setTime(require('cron').time(time));
        }
    }
};
