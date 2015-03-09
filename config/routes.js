module.exports.routes = {
    'get /account': {
        controller : 'account',
        action : 'find'
    },

    'get /account/auth': {
        controller : 'account',
        action : 'auth'
    },

    'get /project/:title/trigger/:evt': {
        controller : 'project',
        action : 'trigger'
    },
    'get /project/:title': {
        controller : 'project',
        action : 'find'
    },
    'put /project/:title': {
        controller : 'project',
        action : 'updata'
    },
    'delete /project/:title': {
        controller : 'project',
        action : 'destroy'
    },

    'get /project/:title/task' : {
        controller : 'task',
        action : 'find'
    },
    'get /project/:title/hooks': {
        controller : 'project',
        action : 'hooks'
    },
    'put /project/:title/trigger/:evt': {
        controller : 'project',
        action : 'trigger'
    },

    'get /project/:title/rollback': {
        controller : 'project',
        action : 'rollback'
    },

    // 'get /hook/template/:type' : {
    //     controller : 'hook',
    //     action : 'template'
    // },
    'get /task/:title' : {
        controller : 'task',
        action : 'find'
    },

    'get /task/:taskId/log' : {
        controller : 'task',
        action : 'getLog'
    },

    'put /task/review' : {
        controller : 'task',
        action : 'review'
    },

    'put /hook/:id' : {
        controller: 'hook',
        action: 'update'
    },

    'post /project/:projectTitle/cron' : {
        controller: 'cron',
        action: 'create'
    },

    'get /project/:projectTitle/cron' : {
        controller: 'cron',
        action: 'find'
    },

    'get /project/:projectTitle/cron/:title' : {
        controller: 'cron',
        action: 'find'
    },

    'put /project/:projectTitle/cron/:title' : {
        controller: 'cron',
        action: 'update'
    },

    'put /project/:projectTitle/cron/:title/toggle' : {
        controller: 'cron',
        action: 'toggle'
    }
};
