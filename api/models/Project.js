module.exports = {
    enums : {
        TYPE : {
            GITHUB : 0,
            SELF_HOST_GIT : 1
        }
    },
    attributes : {
        title : 'STRING',
        description : 'STRING',
        url : 'STRING',
        type : 'INTEGER',
        stagingServer : 'ARRAY',
        productionServer : 'ARRAY',
        notificationList : 'ARRAY',
        manager : 'ARRAY',
        designer : 'ARRAY',
        develpoer : 'ARRAY',
        lastStagingBuild : 'STRING',
        lastProdctuionBuild : 'STRING'
    }
};
