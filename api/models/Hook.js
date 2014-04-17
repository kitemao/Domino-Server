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
                if (this.event === 'buildStaging') {
                    Jenkins.runJobAsync(task.projectTitle, 'staging', task);
                } else if (this.event === 'buildProduction') {
                    Jenkins.runJobAsync(task.projectTitle, 'production', task);
                }
            }.bind(this));
        }
    }
};
