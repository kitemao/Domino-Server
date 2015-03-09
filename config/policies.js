/**
 * Policy mappings (ACL)
 *
 * Policies are simply Express middleware functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect just one of its actions.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */


module.exports.policies = {
    '*': false,

    ProjectController: {
        '*': 'sessionAuth',
        'trigger': [ 'sessionAuth', 'hasPublishAuth' ]
    },

    TaskController: {
        '*': 'sessionAuth'
    },

    HookController: {
        '*': 'sessionAuth'
    },

    cronController: {
        '*': 'sessionAuth',
        'toggle' : [ 'sessionAuth', 'projectOperateAuth' ],
        'create' : [ 'sessionAuth', 'projectOperateAuth' ],
        'update' : [ 'sessionAuth', 'projectOperateAuth' ]
    },

    AccountController: {
        '*': 'sessionAuth'
    }
};

