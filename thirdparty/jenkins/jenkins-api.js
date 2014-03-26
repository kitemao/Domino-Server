var Q = require('q');
var request = require('request');

var API_PREFIX = '';

var auth = {
    user : '',
    pass : ''
};

var requestJenkins = function () {
    arguments[0].url = API_PREFIX + arguments[0].url;

    request.apply(this, arguments);
};

module.exports = {
    setAuth : function (user, pass) {
        auth.user = user;
        auth.pass = pass;

        return this;
    },
    setAPIPrefix : function (prefix) {
        API_PREFIX = prefix;

        return this;
    },
    createJobAsync : function (name, config) {
        var deferred = Q.defer();

        requestJenkins({
            method : 'POST',
            url : '/createItem',
            auth : auth,
            qs : {
                name : name
            },
            headers : {
                'Content-Type' : 'text/xml'
            },
            body : config
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },
    addJobToView : function (viewName, jobName) {
        var deferred = Q.defer();

        requestJenkins({
            method : 'POST',
            url : '/view/' + viewName + '/addJobToView',
            auth : auth,
            qs : {
                name : jobName
            }
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },
    deleteJobAsync : function (name) {
        var deferred = Q.defer();

        requestJenkins({
            method : 'POST',
            url : '/job/' + name + '/doDelete',
            auth : auth
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },
    runJobAsync : function (name) {
        var deferred = Q.defer();

        requestJenkins({
            method : 'POST',
            url : '/job/' + name + '/build',
            auth : auth
        }, function (err, res, body) {
            if (res.statusCode === 201) {
                deferred.resolve(res.headers.location);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    }
};
