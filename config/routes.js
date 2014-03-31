module.exports.routes = {
    'get /project/:title/trigger/:evt': {
        controller : 'project',
        action : 'trigger'
    },
    'get /project/:title': {
        controller : 'project',
        action : 'find'
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
    }
};
