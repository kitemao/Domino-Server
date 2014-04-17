/*global Hook, _*/
var Q = require('q');

module.exports = {
    attributes: {
        accountName: {
            type : 'STRING',
            required : true
        },
        displayName: {
            type : 'STRING',
            required : true
        },
        role: 'NUMBER'
    },
    addAsync: function (user) {
        var deferred = Q.defer();

        User.findOne({
            accountName: user.accountName
        }).then(function (u) {
            if (!u) {
                User.create(user)
                    .then(function (newUser) {
                    deferred.resolve(newUser);
                });
            } else {
                User.update({
                    id: u.id
                }, user).then(function (newUser) {
                    deferred.resolve(newUser);
                });
            }
        });

        return deferred.promise;
    }
};
