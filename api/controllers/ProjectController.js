var fs = require('fs');

var ejs = require('ejs');
var Q = require('q');
var request = require('request');

var StatusCode = require('../../utils/StatusCodeMapping');
var Msg = require('../../utils/MsgMapping');
var Jenkins = require('../../thirdparty/jenkins/jenkins');

var newProjectTpl = ejs.compile(fs.readFileSync(__dirname + '/../../views/misc/project.ejs', {
    encoding : 'utf8'
}));

var updateBuildingScriptAsync = function (data) {
    var deferred = Q.defer();

    var script = newProjectTpl({
        title : data.title,
        servers : data.stagingServers,
        receivers : data.notificationList.map(function (item) {
            return item + '@wandoujia.com';
        }),
        url : data.url
    });

    request({
        method : 'POST',
        url : 'http://deploy.wandoulabs.com/apisave',
        form : {
            username : 'wangye.zhao',
            password : 'Zwy13603614886',
            title : 'conf.test/Frontend/' + data.title + '/deploy-staging.xml',
            content : script
        }
    }, function (err, res, body) {
        if (res.statusCode === 200) {
            deferred.resolve(body);
        } else {
            deferred.reject(new Error(body));
        }
    });

    return deferred.promise;
};

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
                })
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
                    updateBuildingScriptAsync(data).then(function () {
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
