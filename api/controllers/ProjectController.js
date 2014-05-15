var Q = require('q');
var yaml = require('js-yaml');

var _ = require('underscore');

var fs = require('fs');

var StatusCode = require('../../utils/StatusCodeMapping');
var Msg = require('../../utils/MsgMapping');
var Jenkins = require('../../thirdparty/jenkins/jenkins');
var WandouLabs = require('../../thirdparty/wandoulabs/wandoulabs');

var generateTemplateHooksAsync = function (title) {
    var deferred = Q.defer();

    var templates = [{
        title : 'Build Staging',
        projectTitle : title,
        order : -1,
        event : 'buildStaging',
        type : 0
    }, {
        title : 'Build Production',
        projectTitle : title,
        order : -1,
        event : 'buildProduction',
        type : 0
    }];

    Q.all([
        Hook.create(templates[0]),
        Hook.create(templates[1])
    ]).then(function (result) {
        deferred.resolve(result);
    });

    return deferred.promise;
};

function dealData(data) {
    data.stagingServers = data.stagingServers.split('|');
    data.productionServers = data.productionServers.split('|');
    data.notificationList = data.notificationList.split('|');

    return data;
}

function updateBuildScirpt(data) {
    var deferred = Q.defer();

    Hook.find({
        projectTitle: data.title
    }).then(function (hooks) {
        var stagingData    = _.clone(data);
        var productionData = _.clone(data);

        _.each(hooks, function (hook) {
            if (hook.title === 'Build Staging') {
                stagingData.script = hook.script;
            }
            else if (hook.title === 'Build Production') {
                productionData.script = hook.script;
            }
        });

        Q.all([
            WandouLabs.updateBuildingScriptAsync(stagingData, 'deploy-staging'),
            WandouLabs.updateBuildingScriptAsync(productionData, 'deploy-production')
        ]).then(deferred.resolve, deferred.reject);
    });

    return deferred.promise;
}

module.exports = {
    hooks : function (req, res) {
        var title = req.param('title');

        Hook.find({
            projectTitle : title
        }).then(function (hooks) {
            if (hooks.length !== 0) {
                res.json({
                    body : hooks
                }, StatusCode.SUCCESS);
            } else {
                res.json({}, StatusCode.NOT_FOUND);
            }
        });
    },
    updata: function (req, res) {
        var title = req.param('title');

        var data = req.body;
        data = dealData(data);

        Project.update({
            title: title
        }, data).then(function (project) {

            updateBuildScirpt(data).then(function () {
                res.json({
                    body: project
                }, StatusCode.SUCCESS);
            });
        }, function (err) {
            res.send({
                err : {
                    msg : err.toString()
                }
            }, StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED);
        });
    },
    trigger : function (req, res) {
        var title = req.param('title');
        var evt = req.param('evt');

        Hook.findOne({
            projectTitle: title,
            event: evt
        }).then(function (hook) {
            if (hook !== undefined) {
                hook.run(req.session.accountName);
                res.send({
                    body : hook
                }, StatusCode.SUCCESS);
            } else {
                res.send({}, StatusCode.NOT_FOUND);
            }
        });
    },
    find : function (req, res) {
        var title = req.param('title');
        if (title !== undefined) {
            Project.findOne({
                title : title
            }).then(function (project) {
                if (project !== undefined) {
                    res.send({
                        body : project
                    }, StatusCode.SUCCESS);
                } else {
                    res.send({}, StatusCode.NOT_FOUND);
                }
            });
        } else {
            Project.find().then(function (projects) {

                if (projects !== undefined) {

                    // projects.forEach(function (project, index) {
                    //     // add build result
                    //     Task.findOne({
                    //         projectTitle: project.title
                    //     }).sort(
                    //         'startTime DESC'
                    //     ).then(function (task) {

                    //         if (task !== undefined) {
                    //             project.lastTaskStatus = task.status;
                    //         }
                    //     });
                    // });
                    res.send({
                        body : projects
                    }, StatusCode.SUCCESS);
                }
                else {

                    res.send({
                        body : projects
                    }, StatusCode.SUCCESS);
                }
            });
        }
    },
    create : function (req, res) {
        var data = req.body;
        data.stagingServers = data.stagingServers.split('|');
        data.productionServers = data.productionServers.split('|');
        data.notificationList = data.notificationList.split('|');

        var createProject = function () {
            return Project.create({
                title : data.title,
                description : data.description,
                url : data.url,
                type : parseInt(data.type, 10),
                stagingServers : data.stagingServers,
                productionServers : data.productionServers,
                notificationList : data.notificationList
            }).fail(function (err) {
                res.json({
                    err : {
                        msg : err
                    }
                }, StatusCode.FORM_VALIDATION_ERROR);
            });
        };

        var createProjectOnJenkins = function () {
            console.info(data);
            return Jenkins.createJobsAsync(data).fail(function (err) {
                res.send({
                    err : {
                        msg : err.toString()
                    }
                }, StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED);
            });
        };

        var dealWithProjectOnJenkins = function () {

            if (process.env.NODE_ENV === 'production') {

                return createProjectOnJenkins();
            } else {
                var deferred = Q.defer();

                Jenkins.deleteJobsAsync(data).fin(function () {
                    createProjectOnJenkins().then(deferred.resolve, deferred.reject);
                });

                return deferred.promise;
            }
        };

        // then(function () {
        //         createProject.call(this);
        //     },

        // Check if the project already exists.
        Project.findOne({
            title : data.title
        }).done(function (err, project) {
            if (project !== undefined) {
                res.send({
                    err : {
                        parameter : ['title'],
                        msg : [Msg.REPO_ALREADY_EXISTS]
                    }
                }, StatusCode.RESOURCE_DUPLICATED);
            } else {
                if (process.env.NODE_ENV === 'test') {
                    createProject.call(this);
                } else {

                    // 创建domino项目，先进行数据校验
                    createProject().then(function (project) {
                        Q.all([
                            dealWithProjectOnJenkins(), // 创建Jenkins项目
                            generateTemplateHooksAsync(data.title) // 创建hook
                        ]).then(function (result) {

                            var stagingData = _.extend({script: result[1][0]['script']}, data);
                            var productionData = _.extend({script: result[1][1]['script']}, data);

                            // 创建deploy tasks
                            // 需要project data 和 hook data
                            Q.all([
                                WandouLabs.updateBuildingScriptAsync(stagingData, 'deploy-staging'),
                                WandouLabs.updateBuildingScriptAsync(productionData, 'deploy-production')
                            ]).then(function () {
                                res.json({
                                    body : project
                                }, StatusCode.SUCCESS);

                            }, function (err) {
                                res.send({
                                    err : {
                                        msg : err.toString()
                                    }
                                }, StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED);
                            });
                        });

                    });
                }
            }
        });
    },
    destroy: function (req, res) {
        var title = req.param('title');

        if (typeof title !== 'undefined') {
            // TODO: 目前deploy xml为手动删除，后续push rd添加api，改为自动删除

            // 删除jenkins
            Jenkins.deleteJobsAsync({title: title}).then(function () {
                // 删除项目
                Project.destroy({
                    title: title
                }).done(function (err) {
                    if (!err) {
                        res.send({}, StatusCode.SUCCESS);
                    }
                });
            }, function (err) {
                res.send({
                    err: {
                        msg : err.toString()
                    }
                }, StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED);
            });
        }
    }
};
