var fs = require('fs');

var ejs = require('ejs');
var Q = require('q');
var request = require('request');

var newJenkinsJobTpl = ejs.compile(fs.readFileSync(__dirname + '/../views/misc/jenkinsJob.ejs', {
    encoding : 'utf8'
}));



module.exports = {
    createJobAsync : function (data) {
        var deferred = Q.defer();

        var script = newJenkinsJobTpl({
            description : data.description,
            title : data.title,
            taskName : 'deploy-staging'
        });

        request({
            method : 'POST',
            url : 'http://10.0.22.110:8080/createItem',
            auth : {
                user : 'wangye.zhao',
                pass : 'Zwy13603614886'
            },
            qs : {
                name : 'Domino-Test'
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
    runJobAsync : function () {
        // TODO
    }
};
