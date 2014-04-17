var StatusCode = require('../../utils/StatusCodeMapping');

module.exports = {
    find : function (res, req) {
        var title = res.param('title');
        var pageSize = res.param('pageSize') || 20;
        var page = res.param('page') || 1;

        if (title) {
            Task.find({
                projectTitle : title
            }).limit(pageSize)
                .skip(Math.max(page - 1, 1))
                .sort('startTime DESC')
                .then(function (tasks) {
                    req.json({
                        body : tasks
                    }, StatusCode.SUCCESS);
                });
        } else {
            Task.find()
                .sort('startTime DESC')
                .then(function (tasks) {
                    req.json({
                        body : tasks
                    }, StatusCode.SUCCESS);
                });

        }
    }
};
