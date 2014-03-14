/**
 * Project
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

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
