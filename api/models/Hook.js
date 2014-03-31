var Jenkins = require('../../thirdparty/jenkins/jenkins');

module.exports = {
    attributes : {
        title : 'STRING',
        projectTitle : 'STRING',
        order : 'INTEGER',
        event : 'STRING',
        type : 'INTEGER',
        script : 'STRING',

        run : function () {
            Task.create({
                startTime : new Date(),
                status : Task.enums.STATUS.CREATED,
                projectTitle : this.projectTitle,
                title : this.title
            }).then(function (task) {
                Jenkins.runJobAsync(task.projectTitle, 'staging', task);
            });
        }
    }
};
