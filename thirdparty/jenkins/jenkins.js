var fs = require('fs');

var ejs = require('ejs');
var Q = require('q');

var config = require('../../config');

var JenkinsAPI = require('./jenkins-api')
                    .setAuth(config.PUBLIC_LDAP_AUTH.USERNAME, config.PUBLIC_LDAP_AUTH.PASSWORD)
                    .setAPIPrefix(config.JENKINS_API_URL);

var newJenkinsJobTpl = ejs.compile(fs.readFileSync(__dirname + '/jenkinsJob.ejs', 'utf8'));

module.exports = {
    createJobsAsync : function (data) {
        var deferred = Q.defer();

        var staingJobName = data.title + '-deploy-staging';
        var productionJobName = data.title + '-deploy-production';

        Q.all([
            JenkinsAPI.createJobAsync(staingJobName, newJenkinsJobTpl({
                description : data.description,
                title : data.title,
                taskName : 'deploy-staging'
            })),
            JenkinsAPI.createJobAsync(productionJobName, newJenkinsJobTpl({
                description : data.description,
                title : data.title,
                taskName : 'deploy-production'
            }))
        ]).then(function () {
            Q.all([
                JenkinsAPI.addJobToView(config.JENKINS_VIEW_NAME, staingJobName),
                JenkinsAPI.addJobToView(config.JENKINS_VIEW_NAME, productionJobName)
            ]).then(function () {
                deferred.resolve();
            }, function (err) {
                deferred.reject(err);
            });
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    },
    deleteJobsAsync : function (data) {
        var deferred = Q.defer();

        Q.all([
            JenkinsAPI.deleteJobAsync(data.title + '-deploy-staging'),
            JenkinsAPI.deleteJobAsync(data.title + '-deploy-production'),
        ]).then(function () {
            deferred.resolve();
        }, function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    },
    getProgress : function (location, task) {
        JenkinsAPI.getQueueItemAsync(location).then(function (res) {
            if (res.body.executable) {
                Task.update({
                    id : task.id
                }, {
                    status : Task.enums.STATUS.RUNNING
                }).then(function () {
                    JenkinsAPI.getProgressAsync(res.body.executable.url, function (progress) {
                        sails.io.sockets.emit('task.progress', {
                            id : task.id,
                            progress : progress
                        });
                    }).then(function () {
                        JenkinsAPI.getBuildStatusAsync(res.body.executable.url).then(function (res) {
                            if (res.body.result === 'FAILUE') {
                                Task.update({
                                    id : task.id
                                }, {
                                    status : Task.enums.STATUS.FAILED
                                }).then(function () {
                                    return;
                                });
                            }
                        });
                    });
                }, function (err) {

                });
            } else {
                setTimeout(function () {
                    this.getProgress(location, task);
                }.bind(this), 1000);
            }
        }.bind(this));
    },
    runJobAsync : function (title, type, task) {
        var deferred = Q.defer();

        JenkinsAPI.runJobAsync(title + '-deploy-' + type).then(function (location) {
            Task.update({
                id : task.id
            }, {
                status : Task.enums.STATUS.QUEUE
            }).then(function () {
                this.getProgress(location, task);
            }.bind(this), function (err) {

            });

            deferred.resolve({
                location : location
            });
        }.bind(this), function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    }
};
