var fs = require('fs');

var ejs = require('ejs');
var Q = require('q');
var request = require('request');

var newJenkinsJobTpl = ejs.compile(fs.readFileSync(__dirname + '/jenkinsJob.ejs', {
    encoding : 'utf8'
}));

var API_PREFIX = 'http://10.0.22.110:8080';

var auth = {
    user : 'wangye.zhao',
    pass : 'Zwy13603614886'
};

requestJenkins = function () {
    arguments[0].url = API_PREFIX + arguments[0].url;

    request.apply(this, arguments);
};

module.exports = {
    createJobAsync : function (data) {
        var deferred = Q.defer();

        var script = newJenkinsJobTpl({
            description : data.description,
            title : data.title,
            taskName : 'deploy-staging'
        });

        requestJenkins({
            method : 'POST',
            url : '/createItem',
            auth : auth,
            qs : {
                name : 'data.title'
            },
            headers : {
                'Content-Type' : 'text/xml'
            },
            body : script
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },
    deleteJobAsync : function () {
        // TODO
    },
    runJobAsync : function (jobName) {
        var deferred = Q.defer();

        requestJenkins({
            method : 'POST',
            url : '/' + jobName + '/build',
            auth : auth
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(new Error(body));
            }
        });
    }
};
