var Q = require('q');

module.exports = {
    enums: {
        STATUS: {
            CREATED: 0,
            QUEUE: 1,
            RUNNING: 2,
            PAUSE: 3,
            FAILED: 4,
            FOURCE_RUNING: 5,
            SUCCESS: 6
        },
        REVIEWSTATUS: {
            UNCHECK: 0,
            RIGHT: 1,
            WRONG: 2
        }
    },

    // 发邮件的间隔时间
    mailIntervalTime: 5 * 60 * 1000,

    attributes: {
        version: 'STRING',
        startTime: 'DATE',
        endTime: 'DATE',
        status: 'INTEGER',
        initor: 'STRING',
        designer: 'STRING',
        manager: 'STRING',
        projectTitle: 'STRING',
        title: 'STRING',
        entrance: 'STRING',
        //log: 'STRING',
        branch: 'STRING',
        reviewStatus: {
            type: 'INTEGER',
            defaultsTo: 0
        }
    },
    afterCreate : function (task, next) {
        sails.io.sockets.emit('task.add', task);
        next();
    },

    afterUpdate: function (task, next) {
        sails.io.sockets.emit('task.change', task);
        next();

        // 监听状态的变化
        if (task.title === 'Build Production') {

            if (task.status === Task.enums.STATUS.SUCCESS) {

                console.log('Task.mailIntervalTime:', Task.mailIntervalTime);

                // 成功则触发邮件通知循环
                // 10分钟内review完成
                sendMail(Task.mailIntervalTime, 'reviewWarn').then(function () {

                    sendMail(Task.mailIntervalTime, 'reviewPunish');
                });

            }
        }

        function sendMail(time, emailType) {
            var deferred = Q.defer();

            console.log('mail:' + task.id + ';time:', time);
            setTimeout(function () {
                console.log('mail begin:' + task.id);

                Task.findOne({_id: task.id}).then(function (t) {
                    // 如果没有review, 则发邮件进行提醒
                    if (!t.reviewStatus) {

                        // 发邮件
                        require('../../email/email').send(emailType, {
                            initor: t.initor
                        });

                        deferred.resolve();
                    }
                });
            }, time);

            return deferred.promise;
        }
    }
};
