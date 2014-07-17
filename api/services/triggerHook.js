/**
 * 根据hook title来trigger
 */

module.exports = function (options) {

    var hookTitle   = options.title;
    var params      = options.params;

    var wandoulabsTrigger = require('sails').services.wandoulabstriggerhook;
    // todo: 此处直接写死了，应该是根据title来调用不同的hook triggerService,
    // 但由于目前只有wandoulabs hook, 暂时这样
    // 后续扩展需要有hook注册功能
    wandoulabsTrigger({
        title: hookTitle,
        params: params
    });
};
