var StatusCode = require('../../utils/StatusCodeMapping');

module.exports = {
    find : function (res, req) {
        var title = res.param('title');
        var pageSize = res.param('pageSize') || 20;
        var page = res.param('page') || 1;

        if (title) {
            Task.count().then(function (count) {
                Task.find({
                    projectTitle : title
                }).sort('startTime DESC')
                    .paginate({
                        page: Math.max(page - 1, 1),
                        limit: pageSize
                    }).then(function (tasks) {
                        req.json({
                            body: tasks,
                            max: count
                        }, StatusCode.SUCCESS);
                    });
            });
        } else {
            Task.count().then(function (count) {
                Task.find()
                    .sort('startTime DESC')
                    .paginate({
                        page: Math.max(page - 1, 1),
                        limit: pageSize
                    }).then(function (tasks) {
                        req.json({
                            body: tasks,
                            max: count
                        }, StatusCode.SUCCESS);
                    });
            });
        }
    }
};
