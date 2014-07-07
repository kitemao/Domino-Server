/**
 * wandoulabs trigger hook
 */

var Q          = require('q');
var _          = require('underscore');
var WandouLabs = require('../../thirdparty/wandoulabs/wandoulabs');

function updateBuildScirpt(data) {
    var deferred = Q.defer();

    Hook.find({
        projectTitle: data.title
    }).then(function (hooks) {
        var stagingData    = _.clone(data);
        var productionData = _.clone(data);

        _.each(hooks, function (hook) {
            if (hook.title === 'Build Staging') {
                stagingData.script = hook.script;
            }
            else if (hook.title === 'Build Production') {
                productionData.script = hook.script;
            }
        });

        Q.all([
            WandouLabs.updateBuildingScriptAsync(stagingData, 'deploy-staging'),
            WandouLabs.updateBuildingScriptAsync(productionData, 'deploy-production')
        ]).then(deferred.resolve, deferred.reject);
    });

    return deferred.promise;
}

module.exports = function (options) {

    var deferred = Q.defer();

    var title        = options.title;
    var params       = options.params || {};
    var projectTitle = params.projectTitle ? params.projectTitle : '';
    var branch       = params.branch       ? params.branch       : 'master';
    var operator     = params.operator     ? params.operator     : 'master';

    Hook.findOne({
        projectTitle: projectTitle,
        title: title
    }).then(function (hook) {
        if (hook !== undefined) {
            Project.findOne({
                title: projectTitle
            }).then(function (project) {
                // 重新更新
                project.version = branch;

                updateBuildScirpt(project).then(function () {
                    console.log(32323);
                    hook.run({
                        branch: branch,
                        accountName: operator
                    });
                }, function (err) {
                    console.log(err);
                });
            }, function (err) {
                console.log(err);
                deferred.reject();
            });
        }
        else {

            deferred.reject();
        }
    }, function (err) {
        console.log(err);
    });

    return deferred.promise;
};
