var Jenkins = require('../../thirdparty/jenkins/jenkins');

module.exports = {
    attributes: {
        title: 'STRING',
        projectTitle: 'STRING',
        order: 'INTEGER',
        event: 'STRING',
        type: 'INTEGER',
        script: {
            type: 'STRING',
            defaultsTo: 'cd $source_dir; npm i; bower install; grunt build:$type'
        },

        run : function (opts) {
            Task.create({
                startTime: new Date(),
                status: Task.enums.STATUS.CREATED,
                projectTitle: this.projectTitle,
                title: this.title,
                initor: opts.accountName,
                branch: opts.branch
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
