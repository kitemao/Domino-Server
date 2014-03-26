module.exports = {
    enums : {
        TYPE : {
            GITHUB : 0,
            SELF_HOST_GIT : 1
        }
    },
    attributes : {
        title : {
            type : 'STRING',
            required : true
        },
        description : 'STRING',
        url : {
            type : 'STRING',
            required : true
        },
        type : {
            type : 'INTEGER',
            required : true
        },
        stagingServers : {
            type : 'ARRAY',
            required : true
        },
        productionServers : {
            type : 'ARRAY',
            required : true
        },
        notificationList : {
            type : 'ARRAY',
            required : true
        },
        manager : 'ARRAY',
        designer : 'ARRAY',
        develpoer : 'ARRAY',
        lastStagingBuild : 'STRING',
        lastProdctuionBuild : 'STRING'
    }
};
