var fs  = require('fs');
var ejs = require('ejs');
var Q   = require('q');

var request = require('request');
var yaml    = require('js-yaml');

var config  = require('../../config');

// 解析ejs模板文件
var newProjectTpl = ejs.compile(
    fs.readFileSync(__dirname + '/../../thirdparty/wandoulabs/project.ejs', {
        encoding: 'utf8'
    })
);

/**
 * 将yaml解析为json
 * @param  {string} script yaml字符串
 */
function parseYamlToJson(script) {
    var doc;

    try {
        doc = yaml.safeLoad(script);
    }
    catch (e) {
        throw new Error(e);
    }

    return doc;
}

/**
 * get nofitylist maxin notificationlist managers designers and developers
 */
function getNotifyListFromRole(data) {
    var notificationList = data.notificationList || [];
    var managers   = data.managers;
    var designers  = data.designers;
    var developers = data.developers;

    var mixList = _.union(notificationList, managers, designers, developers);

    return _.map(mixList, function (item) {
        return item + '@wandoujia.com';
    });
}

module.exports = {
    updateBuildingScriptAsync : function (data, taskName) {
        var deferred = Q.defer();
        console.log('build labs xml', data);

        // 解析yaml
        var scriptJson = {};
        if (data.script) {
            scriptJson = parseYamlToJson(data.script);
        }

        // 项目数据
        var defData = {
            title: data.title,
            servers: taskName === 'deploy-staging' ? data.stagingServers : data.productionServers,
            receivers: getNotifyListFromRole(data),
            url : data.url,
            type: taskName === 'deploy-staging' ? 'staging' : 'production',
            version: data.version || 'master'
        };

        var tplData = _.extend({}, scriptJson, defData);

        var script = newProjectTpl(tplData);

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
            console.log('cron:', res.statusCode);
            if (res.statusCode === 200) {
                deferred.resolve(body);
            } else {
                deferred.reject(new Error(body));
            }
        });

        return deferred.promise;
    },

    /**
     * 暴露默认的yaml配置脚本，以便外面使用
     * @return {[string]} 为yaml脚本字符串
     */
    getDefScript: function () {

        // 获取默认的脚本
        // 默认脚本保存在第三方代码里，为了不污染hook,但需要创建hook的时候主动获取。。。。好矛盾呀。。。。
        // todo: polish
        return fs.readFileSync(__dirname + '/defaultScript.yml', {
            encoding: 'utf8'
        });
    }
};
