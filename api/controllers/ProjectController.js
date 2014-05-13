var Q = require('q');
var yaml = require('js-yaml');

var fs = require('fs');

var StatusCode = require('../../utils/StatusCodeMapping');
var Msg = require('../../utils/MsgMapping');
var Jenkins = require('../../thirdparty/jenkins/jenkins');
var WandouLabs = require('../../thirdparty/wandoulabs/wandoulabs');

var generateTemplateHooksAsync = function (title) {
    var deferred = Q.defer();

    var runAsync = function (task) {
        var deferred = Q.defer();

        task.then(function (hook) {
            deferred.resolve(hook);
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    var templates = [{
        title : 'Build Staging',
        projectTitle : title,
        order : -1,
        event : 'buildStaging',
        type : 0,
        script : ''
    }, {
        title : 'Build Production',
        projectTitle : title,
        order : -1,
        event : 'buildProduction',
        type : 0,
        script : ''
    }];

    Q.all([
        Hook.create(templates[0]),
        Hook.create(templates[1])
    ]).then(function () {
        deferred.resolve();
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
    return Q.all([
        WandouLabs.updateBuildingScriptAsync(data, 'deploy-staging'),
        WandouLabs.updateBuildingScriptAsync(data, 'deploy-production')
    ]);
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

        // 更新文档
        updateBuildScirpt(data).then(function () {
            //更新项目
            Project.update({
                title: title
            }, data).then(function (project) {
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
            Project.create({
                title : data.title,
                description : data.description,
                url : data.url,
                type : parseInt(data.type, 10),
                stagingServers : data.stagingServers,
                productionServers : data.productionServers,
                notificationList : data.notificationList
            }).then(function (project) {
                generateTemplateHooksAsync(project.title).then(function () {
                    res.json({
                        body : project
                    }, StatusCode.SUCCESS);
                }, function () {
                    res.json({
                        body : project
                    }, StatusCode.SUCCESS);
                });
            }, function (err) {
                res.json({
                    err : {
                        msg : err
                    }
                }, StatusCode.FORM_VALIDATION_ERROR);
            });
        };

        var createProjectOnJenkins = function () {
            Jenkins.createJobsAsync(data).then(function () {
                createProject.call(this);
            }, function (err) {
                res.send({
                    err : {
                        msg : err.toString()
                    }
                }, StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED);
            });
        };

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
                    // Generate config files for deploy tasks.
                    Q.all([
                        WandouLabs.updateBuildingScriptAsync(data, 'deploy-staging'),
                        WandouLabs.updateBuildingScriptAsync(data, 'deploy-production')
                    ]).then(function () {
                        // Generate new jobs on Jenkins
                        if (process.env.NODE_ENV === 'production') {
                            createProjectOnJenkins.call(this);
                        } else {
                            Jenkins.deleteJobsAsync(data).fin(function () {
                                createProjectOnJenkins.call(this);
                            });
                        }
                    }, function (err) {
                        res.send({
                            err : {
                                msg : err.toString()
                            }
                        }, StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED);
                    });
                }
            }
        });
    }
};
