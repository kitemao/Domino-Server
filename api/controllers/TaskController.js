var Q = require('q');

var StatusCode = require('../../utils/StatusCodeMapping');

module.exports = {
    find : function (res, req) {
        var title = res.param('title');
        var pageSize = res.param('pageSize') || 20;
        var page = res.param('page') || 1;

        var queryTaskAsync;

        if (title) {
            queryTaskAsync = Task.find({
                projectTitle : title
            }).sort('startTime DESC')
                .paginate({
                    page: Math.max(page - 1, 1),
                    limit: pageSize
                });

            Q.all([
                Task.count({
                    projectTitle : title
                }),
                queryTaskAsync
            ]).then(function (results) {
                req.json({
                    body: results[1],
                    max: results[0]
                }, StatusCode.SUCCESS);
            });
        } else {
            queryTaskAsync = Task.find()
                .sort('startTime DESC')
                .paginate({
                    page: Math.max(page - 1, 1),
                    limit: pageSize
                });

            Q.all([
                Task.count(),
                queryTaskAsync
            ]).then(function (results) {
                req.json({
                    body: results[1],
                    max: results[0]
                }, StatusCode.SUCCESS);
            });
        }
    }
};
