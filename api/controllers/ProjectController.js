var StatusCode = require('../../utils/StatusCodeMapping');
var Msg = require('../../utils/MsgMapping');
var Jenkins = require('../../thirdparty/jenkins/jenkins');
var WandouLabs = require('../../thirdparty/wandoulabs/wandoulabs');

module.exports = {
    _config : {},
    build : function (req, res) {
        var title = req.params.title;
    },
    find : function (req, res) {
        var id = req.param('id');
        if (id !== undefined) {
            Project.findOne({
                id : id
            }).then(function (project) {
                if (project !== undefined) {
                    res.send({
                        body : project
                    });
                } else {
                    res.send({});
                }
            });
        } else {
            Project.find().then(function (projects) {
                res.send({
                    body : projects
                });
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
                res.json({
                    body : project
                }, StatusCode.SUCCESS);
            });
        };

        Project.findOne({
            url : data.url
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
                    WandouLabs.updateBuildingScriptAsync(data).then(function () {
                        Jenkins.createJobAsync(data).then(function () {
                            createProject.call(this);
                        }, function (err) {
                            res.send({
                                err : {
                                    msg : err.toString()
                                }
                            }, StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED);
                        });
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
