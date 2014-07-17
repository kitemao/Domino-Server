module.exports = {
    attributes: {
        title: {
            type : 'STRING',
            required : true
        },
        projectTitle: {
            type : 'STRING',
            required : true
        },
        time: {
            type : 'STRING',
            required : true
        },
        hooks: {
            type : 'Array',
            required : true
        },
        status: {
            type : 'STRING',
            defaultsTo: 1 // 0启动 1暂停
        },
        times: {
            type : 'STRING',
            defaultsTo: 0
        }
    }
};
