var StatusCode = require('../../utils/StatusCodeMapping');

module.exports = {
    find : function (res, req) {
        var title = res.param('title');

        if (title) {
            Task.find({
                projectTitle : title
            }).then(function (tasks) {
                req.json({
                    body : tasks
                }, StatusCode.SUCCESS);
            });
        } else {
            Task.find().then(function (tasks) {
                req.json({
                    body : tasks
                }, StatusCode.SUCCESS);
            });

        }
    }
};
