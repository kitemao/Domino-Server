module.exports = {
    enums : {
        STATUS : {
            CREATED : 0,
            QUEUE : 1,
            RUNNING : 2,
            PAUSE : 3,
            FAILED : 4,
            FOURCE_RUNING : 5,
            SUCCESS : 6
        }
    },
    attributes : {
        version : 'STRING',
        startTime : 'DATE',
        endTime : 'DATE',
        status : 'INTEGER',
        initor : 'STRING',
        designer : 'STRING',
        manager : 'STRING',
        projectTitle : 'STRING',
        title : 'STRING'
    },
    afterCreate : function (task, next) {
        sails.io.sockets.emit('task.add', task);
        next();
    },
    afterUpdate : function (task, next) {
        sails.io.sockets.emit('task.change', task);
        next();
    }
};
