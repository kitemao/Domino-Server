module.exports.routes = {
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
    'post /project/:title/trigger/:evt': {
        controller : 'project',
        action : 'trigger'
    },
    // 'get /hook/template/:type' : {
    //     controller : 'hook',
    //     action : 'template'
    // },
    'get /task/:title' : {
        controller : 'task',
        action : 'find'
    },
    'put /hook/:id' : {
        controller: 'hook',
        action: 'update'
    }
};
