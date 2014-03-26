/*global Project, Hook*/
var Q = require('q');
var fs = require('fs');

var StatusCode = require('../../utils/StatusCodeMapping');
var Msg = require('../../utils/MsgMapping');
var Jenkins = require('../../thirdparty/jenkins/jenkins');
var WandouLabs = require('../../thirdparty/wandoulabs/wandoulabs');

var generateTemplateHooksAsync = function (projectId) {
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
        projectId : projectId,
        order : -1,
        event : 'buildStaging',
        type : 0,
        script : ''
    }];

    Q.all([
        Hook.create(templates[0])
    ]).then(function () {
        console.log(123);
    });


    return deferred.promise;
};

module.exports = {
    _config : {},
    hooks : function (req, res) {
        var title = req.param('title');

        Project.findOne({
            title : title
        }).then(function (project) {
            if (project !== undefined) {
                Hook.find({
                    projectId : project.id
                }).then(function (hooks) {
                    res.json({
                        body : hooks
                    }, StatusCode.SUCCESS);
                });
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
                    res.send({}, StatusCode.SUCCESS);
                }
            });
        } else {
            Project.find().then(function (projects) {
                res.send({
                    body : projects
                }, StatusCode.SUCCESS);
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
                generateTemplateHooksAsync(project.id).then(function () {
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
