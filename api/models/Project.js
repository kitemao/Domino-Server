/**
 * Project
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes : {
        id : 'integer',
        name : {
            type : 'string',
            required : true,
            notEmpty : true
        },
        alias : {
            type : 'string'
        },
        gitURL :{
            type : 'string',
            required : true,
            notEmpty : true
        },
        owner : {
            type : 'string',
            required : true,
            notEmpty : true
        },
        isActive : {
            type : 'string',
            required : true,
            notEmpty : true
        }
    }
};
