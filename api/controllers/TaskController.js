var StatusCode = require('../../utils/StatusCodeMapping');

module.exports = {
    find : function (res, req) {
        var title = res.param('title');

        if (title) {
            Task.find({
                projectTitle : title
            }).sort('startTime DESC')
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
