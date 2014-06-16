var fs = require('fs');

var ejs = require('ejs');
var Q = require('q');
var request = require('request');

var config = require('../../config');

var newProjectTpl = ejs.compile(fs.readFileSync(__dirname + '/../../thirdparty/wandoulabs/project.ejs', {
    encoding: 'utf8'
}));

module.exports = {
    updateBuildingScriptAsync : function (data, taskName) {
        var deferred = Q.defer();
        console.log(data);
        var script = newProjectTpl({
            title: data.title,
            servers: taskName === 'deploy-staging' ? data.stagingServers : data.productionServers,
            receivers: data.notificationList.map(function (item) {
                return item + '@wandoujia.com';
            }),
            url : data.url,
            type: taskName === 'deploy-staging' ? 'staging' : 'production',
            script: data.script,
            version: data.version || 'master'
        });

        console.log('xml:' + script);

        request({
            method: 'POST',
            url: 'http://deploy.wandoulabs.com/apisave',
            form: {
                username : config.PUBLIC_LDAP_AUTH.USERNAME,
                password : config.PUBLIC_LDAP_AUTH.PASSWORD,
                title : config.WANDOULABS_AUTODEPLOY_SRC + '/' + data.title + '/' + taskName + '.xml',
                content : script
            }
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    }
};
