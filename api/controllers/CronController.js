/*
 * cron control
 *
 * @author  miaojian(miaojian@wandoujia.com)
 */

var Q          = require('q');
var _          = require('underscore');
var StatusCode = require('../../utils/StatusCodeMapping');
var Msg        = require('../../utils/MsgMapping');
var sails      = require('sails');

module.exports = {

    // post
    create: function (res, req) {
        var projectTitle = res.params.projectTitle;
        var data = res.body;

        var creatCronTab      = sails.services.cronservice.creatCronTab;

        Cron.findOne({
            projectTitle: projectTitle,
            title: data.title
        }).then(function (cron) {
            if (cron !== undefined) {

                res.send({
                    err : {
                        parameter : ['title'],
                        msg : [ Msg.REPO_ALREADY_EXISTS ]
                    }
                }, StatusCode.RESOURCE_DUPLICATED);
            }
            else {
                Cron.create({
                    projectTitle: projectTitle,
                    title: data.title,
                    time: data.time,
                    hooks: data.hooks.split(/\r?\n+/)
                }).then(function (data) {

                    // 建立cronTab
                    creatCronTab(data);

                    // 发送请求
                    req.json({
                        body: data
                    }, StatusCode.SUCCESS);
                }, function (err) {
                    req.json({
                        err : {
                            msg : err
                        }
                    }, StatusCode.FORM_VALIDATION_ERROR);
                }, function (err) {
                    console.log(err);
                });
            }
        }, function (err) {
            console.log(err);
        });
    },

    toggle: function (res, req) {
        var projectTitle = res.params.projectTitle;
        var title        = res.params.title;
        var status       = res.body.status;

        var Crontab      = sails.services.crontab;

        Cron.findOne({
            projectTitle: projectTitle,
            title: title
        }).then(function (cron) {

            cron.status = status;
            cron.save(function (err, data) {
                // toggle cronTab
                Crontab.toggle(
                    projectTitle + '-' + title,
                    status === '1' ? false : true
                );

                req.json({
                    body: data
                }, StatusCode.SUCCESS);
            });
        });
    },

    find: function (res, req) {
        var projectTitle = res.params.projectTitle;
        var title        = res.params.title;

        if (title) {

            Cron.findOne({
                projectTitle: projectTitle,
                title       : title
            }).then(function (cron) {
                req.json({
                    body: cron
                }, StatusCode.SUCCESS);
            }, function (err) {
                req.json({
                    body: err
                }, StatusCode.NOT_FOUND);
            });
        }
        else {
            Cron.find({
                projectTitle: projectTitle
            }).then(function (data) {
                req.json({
                    body: data
                }, StatusCode.SUCCESS);
            });
        }
    },

    update: function (res, req) {
        var projectTitle = res.params.projectTitle;
        var title        = res.params.title;
        var data         = res.body;

        // 更新后stop cron，需要手动启动
        data.status = '1';

        var updateCronTab = sails.services.cronservice.updateCronTab;
        var Crontab       = sails.services.crontab;

        Cron.update({
            projectTitle: projectTitle,
            title       : title,
        }, data).then(function () {
            // 先暂停任务
            Crontab.toggle(
                projectTitle + '-' + title,
                false
            );

            // 修改cronTab
            updateCronTab(data);

            req.json({
                body: data
            }, StatusCode.SUCCESS);
        }, function (err) {
            console.log(err);
        });
    }
};
