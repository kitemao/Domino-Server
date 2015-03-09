var fs = require('fs');

var ejs = require('ejs');
var Q = require('q');

var config = require('../../config');

var JenkinsAPI = require('./jenkins-api')
                    .setAuth(config.PUBLIC_LDAP_AUTH.USERNAME, config.PUBLIC_LDAP_AUTH.PASSWORD)
                    .setAPIPrefix(config.JENKINS_API_URL);

var newJenkinsJobTpl = ejs.compile(fs.readFileSync(__dirname + '/jenkinsJob.ejs', 'utf8'));

var postfix = config.JENKINS_PROJECT_POSTFIX || 'deploy';
var postfixStaging = '-' + postfix + '-staging';
var postfixProduction = '-' + postfix + '-production';

module.exports = {
    createJobsAsync: function (data) {
        var deferred = Q.defer();

        var staingJobName = data.title + postfixStaging;
        var productionJobName = data.title + postfixProduction;
        var rollbackJobName = productionJobName + '-rollback';

        Q.all([
            JenkinsAPI.createJobAsync(staingJobName, newJenkinsJobTpl({
                description: data.description,
                title: data.title,
                taskName: 'deploy-staging',
                configPath: config.WANDOULABS_AUTODEPLOY_SRC,
                action: '-u'
            })),
            JenkinsAPI.createJobAsync(productionJobName, newJenkinsJobTpl({
                description: data.description,
                title: data.title,
                taskName: 'deploy-production',
                configPath: config.WANDOULABS_AUTODEPLOY_SRC,
                action: '-u'
            })),
            JenkinsAPI.createJobAsync(rollbackJobName, newJenkinsJobTpl({
                description: data.description,
                title: data.title,
                taskName: 'deploy-production',
                configPath: config.WANDOULABS_AUTODEPLOY_SRC,
                action: '-r'
            })),
        ]).then(function () {
            Q.all([
                JenkinsAPI.addJobToView(config.JENKINS_VIEW_NAME, staingJobName),
                JenkinsAPI.addJobToView(config.JENKINS_VIEW_NAME, productionJobName),
                JenkinsAPI.addJobToView(config.JENKINS_VIEW_NAME, rollbackJobName)
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
            JenkinsAPI.deleteJobAsync(data.title + postfixStaging),
            JenkinsAPI.deleteJobAsync(data.title + postfixProduction),
            JenkinsAPI.deleteJobAsync(data.title + postfixProduction + '-rollback')
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
                    id: task.id
                }, {
                    status: Task.enums.STATUS.RUNNING,
                    entrance: res.body.executable.url
                }).then(function () {
                    var log = '';
                    JenkinsAPI.getProgressAsync(res.body.executable.url, function (progress) {
                        progress = progress.replace(/<span style="display: none;">([\s\S]*?)<\/span>/gi, '');
                        log += progress;

                        sails.io.sockets.emit('task.progress', {
                            id: task.id,
                            projectTitle: task.projectTitle,
                            progress: progress
                        });
                    }).then(function () {
                        JenkinsAPI.getBuildStatusAsync(res.body.executable.url).then(function (res) {
                            console.log('task build result:', res.body.result);
                            Task.update({
                                id: task.id
                            }, {
                                endTime: new Date(),
                                status: res.body.result === 'SUCCESS' ? Task.enums.STATUS.SUCCESS : Task.enums.STATUS.FAILED,
                                reviewStatus: res.body.result === 'SUCCESS' ? Task.enums.REVIEWSTATUS.UNCHECK : Task.enums.REVIEWSTATUS.WRONG,
                            }).then(function (task) {
                                return;
                            });

                            TaskLog.findOne({ taskId: task.id }).then(function (logs) {
                                if (logs !== undefined) {
                                    sails.log.error('task:' + task.id + '-log has exist');
                                }
                                else {
                                    TaskLog.create({taskId: task.id, log: log}).then(function () {
                                        sails.log.info('task:' + task.id + ' log store success');
                                    }, function (err) {
                                        sails.log.error('Store log error: ' + err);
                                    });
                                }
                            });
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
    runJobAsync: function (title, type, task) {
        var deferred = Q.defer();

        JenkinsAPI.runJobAsync(title + '-' + postfix + '-' + type).then(function (location) {
            console.log('begin task to queue');
            Task.update({
                id: task.id
            }, {
                status: Task.enums.STATUS.QUEUE
            }).then(function () {
                this.getProgress(location, task);
            }.bind(this), function (err) {

            });

            deferred.resolve({
                location: location
            });
        }.bind(this), function (err) {
            deferred.reject(err);
        });

        return deferred.promise;
    },
    syncTaskStatusWithJenkins: function () {
        Task.find({
            or: [{
                status: Task.enums.STATUS.CREATED
            }, {
                status: Task.enums.STATUS.QUEUE
            }, {
                status: Task.enums.STATUS.RUNNING
            }]
        }).then(function (tasks) {
            _.each(tasks, function (task) {
                if (task.entrance) {
                    JenkinsAPI.getBuildStatusAsync(task.entrance).then(function (res) {
                        var build = res.body;
                        Task.update({
                            id: task.id
                        }, {
                            endTime: new Date(task.startTime.getTime() + build.duration),
                            // todo: 有可能拿到的是正在运行的任务
                            status: build.result === 'SUCCESS' ? Task.enums.STATUS.SUCCESS : Task.enums.STATUS.FAILED,
                            reviewStatus: res.body.result === 'SUCCESS' ? Task.enums.REVIEWSTATUS.UNCHECK : Task.enums.REVIEWSTATUS.WRONG
                        }).then(function () {
                            return;
                        });
                    });
                }
            });
        });
    }
};
