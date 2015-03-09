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
            }).sort('_id DESC')
                .paginate({
                    page: Math.max(page, 1),
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
            }, function (err) {
                console.error(err);
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
    },

    getLog: function (res, req) {
        var taskId = res.param('taskId');
        console.log('taskId:', taskId);
        TaskLog.findOne({ taskId: taskId }).then(function (log) {
            req.json({
                body: log ? log.log : ''
            }, StatusCode.SUCCESS);
        }, function (err) {
            req.json({
                body: err,
            }, StatusCode.INTERNAL_ERROR);
        });
    },

    review: function (res, req) {
        console.log(res.param);
        var id = res.param('id');
        var reviewStatus = res.param('reviewStatus');

        if (id !== undefined) {

            Task.update({_id: id}, {reviewStatus: reviewStatus})
                .then(function (task) {
                    req.json({
                        body: task
                    }, StatusCode.SUCCESS);
                });
        }
    }
};
