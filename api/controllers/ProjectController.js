var fs = require('fs');
var ejs = require('ejs');

var StatusCode = require('../../utils/StatusCodeMapping');

var newProjectTpl = ejs.compile(fs.readFileSync(__dirname + '/../../views/misc/project.ejs', {
    encoding : 'utf8'
}));

var updateBuildingScriptAsync = function (data) {
    var script = newProjectTpl({
        title : data.title,
        servers : data.stagingServers,
        receivers : data.notificationList.map(function (item) {
            return item + '@wandoujia.com';
        }),
        url : data.url
    });

    // TODO
};

module.exports = {
    _config : {},
    get : function () {

    },
    create : function (req, res) {
        var data = req.body;
        data.stagingServers = data.stagingServers.split('|');
        data.productionServers = data.productionServers.split('|');
        data.notificationList = data.notificationList.split('|');

        Project.findOne({
            url : data.url
        }).done(function (err, project) {
            if (project !== undefined) {
                res.send({
                    status : StatusCode.RESOURCE_DUPLICATED,
                    err : {
                        msg : 'REPO_ALREADY_EXISTS'
                    }
                });
            } else {
                updateBuildingScriptAsync(data).done(function () {
                    Project.create({
                        title : data.title,
                        description : data.description,
                        url : data.url,
                        type : parseInt(data.type, 10),
                        stagingServers : data.stagingServers,
                        productionServers : data.productionServers,
                        notificationList : data.notificationList
                    }).done(function (err, project) {
                        if (!err) {
                            res.send({
                                status : StatusCode.SUCCESS,
                                body : project
                            });
                        }
                    });
                }).fail(function (err) {
                    res.send({
                        status : StatusCode.COMMUNICATION_WITH_THIRDPARTY_FAILED,
                        err : {
                            msg : err.msg
                        }
                    });
                });
            }
        });
    }
};
