var Q = require('q');
var request = require('request');

var API_PREFIX = '';

var auth = {
    user : '',
    pass : ''
};

var requestJenkins = function () {
    arguments[0].url = API_PREFIX + arguments[0].url;
    arguments[0].auth = arguments[0].auth || auth;

    request.apply(this, arguments);
};

var jenkinsAPI = {
    getBuildStatusAsync : function (url) {
        var deferred = Q.defer();

        request({
            method : 'GET',
            url : url + '/api/json',
            json : true,
            auth : auth
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(res);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },
    getProgressAsync : function (url, cb) {
        var deferred = Q.defer();

        var readProgressAsync = function (start) {
            start = start || 0;
            jenkinsAPI.fetchProgressAsync(url, start).then(function (res) {
                if (res.headers['x-more-data']) {
                    setTimeout(function () {
                        readProgressAsync(parseInt(res.headers['x-text-size'], 10));
                    }, 3000);
                } else {
                    deferred.resolve();
                }

                if (res.body) {
                    cb(res.body);
                }
            }, function () {
                readProgressAsync(start);
            });
        };

        readProgressAsync();

        return deferred.promise;
    },
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
            qs : {
                name : name
            },
            headers : {
                'Content-Type' : 'text/xml'
            },
            body : config
        }, function (err, res, body) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                if (res.statusCode === 200) {
                    deferred.resolve(res);
                } else {
                    deferred.reject(new Error(body));
                }
            }
        });

        return deferred.promise;
    },
    addJobToView : function (viewName, jobName) {
        var deferred = Q.defer();

        requestJenkins({
            method : 'POST',
            url : '/view/' + viewName + '/addJobToView',
            qs : {
                name : jobName
            }
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(res);
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
            url : '/job/' + name + '/doDelete'
        }, function (err, res, body) {
            // 如果jenkins没有此项目也标志为成功，目的就是jenkins中没有此项目
            if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 404) {
                deferred.resolve(res);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },
    runJobAsync : function (name) {
        var deferred = Q.defer();
        console.log('begin set jenkins build');

        function requestApi() {
            requestJenkins({
                method : 'POST',
                url : '/job/' + name + '/build'
            }, function (err, res, body) {
                console.log('jenkins build statusCode:', res.statusCode);
                if (res.statusCode === 201) {
                    deferred.resolve(res.headers.location);
                }
                else if (res.statusCode === 401) {

                    // jenkins sometimes will report 401 error, can i fuck a xia xia?
                    setTimeout(function () {
                        requestApi();
                    }, 1000);
                }
                else {
                    deferred.reject(new Error(body));
                }
            });
        }

        requestApi();

        return deferred.promise;
    },
    getQueueItemAsync : function (location) {
        var deferred = Q.defer();

        request({
            method : 'GET',
            url : location + '/api/json',
            json : true,
            auth : auth
        }, function (err, res, body) {
            if (res.statusCode === 200) {
                deferred.resolve(res);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },
    fetchProgressAsync : function (url, type, start) {
        var deferred = Q.defer();

        if (typeof type !== 'string') {
            start = type;
            type = undefined;
        }

        type = type === 'text' ? 'progressiveText' : 'progressiveHtml';

        url += 'logText/' + type;

        // todo: jenkins经常抽风401，所以多次轮训获取最后结果
        function requestApi() {
            request({
                method : 'GET',
                url : url,
                qs : {
                    start : start || 0
                },
                auth : auth
            }, function (err, res, body) {
                console.log('jenkins build statusCode:', res.statusCode);
                if (res.statusCode === 200) {

                    deferred.resolve(res);
                }
                else if (res.statusCode === 401) {

                    setTimeout(function () {

                        requestApi();
                    }, 3000);
                }
                else {

                    deferred.resolve(new Error(body));
                }
            });
        }

        requestApi();

        return deferred.promise;
    }
};

module.exports = jenkinsAPI;
