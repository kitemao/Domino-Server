module.exports.routes = {
    'get /project/:title': {
        controller : 'project',
        action : 'find'
    },
    'get /project/:title/hooks': {
        controller : 'project',
        action : 'hooks'
    }
};
