var fs = require('fs');
var ejs = require('ejs');

var StatusCode = require('../../utils/StatusCodeMapping');

var newProjectTpl = ejs.compile(fs.readFileSync(__dirname + '/../../views/misc/project.ejs', {
    encoding : 'utf8'
}));

module.exports = {
    _config : {},
    get : function () {

    },
    create : function (req, res) {
        var data = req.body;
        data.stagingServer = data.stagingServer.split('|');
        data.productionServer = data.productionServer.split('|');
        data.notificationList = data.notificationList.split('|');


        console.log(newProjectTpl({
            title : data.title,
            servers : data.stagingServer,
            receivers : data.notificationList.map(function (item) {
                return item + '@wandoujia.com';
            }),
            url : data.url
        }));

        // Project.findOne({
        //     url : data.url
        // }).done(function (err, project) {
        //     if (project !== undefined) {
        //         res.send({
        //             status : StatusCode.RESOURCE_DUPLICATED,
        //             err : {
        //                 msg : 'REPO_ALREADY_EXISTS'
        //             }
        //         });
        //     } else {
        //         Project.create({
        //             title : data.title,
        //             description : data.description,
        //             url : data.url,
        //             type : parseInt(data.type, 10),
        //             stagingServer : data.stagingServer.split('|'),
        //             productionServer : data.productionServer.split('|'),
        //             notificationList : data.notificationList.split('|')
        //         }).done(function (err, project) {
        //             if (!err) {
        //                 res.send({
        //                     status : StatusCode.SUCCESS,
        //                     body : project
        //                 });
        //             }
        //         });
        //     }
        // });
    }
};
