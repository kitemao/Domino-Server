var gapis = require('googleapis');
var Q = require('q');

var config = require('../../config');

var CLIENT_ID = config.GOOGLE_API_CLIENT_ID;
var CLIENT_SECRET = config.GOOGLE_API_CLIENT_SECRET;
var REDIRECT_URL = config.GOOGLE_SIGN_IN_REDIRECT_URL;

var oauth2Client = new gapis.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

module.exports = {
    authAsync : function  (tokens) {
        var deferred = Q.defer();

        /* jshint -W106 */
        tokens.expires_in = parseInt(tokens.expires_in, 10);

        oauth2Client.setCredentials(tokens);

        gapis
            .discover('plus', 'v1')
            .execute(function (err, client) {
                client
                    .plus.people.get({ userId: 'me' })
                    .withAuthClient(oauth2Client)
                    .execute(function (err, response, body) {
                        if (!err && response.domain === 'wandoujia.com') {
                            deferred.resolve();
                        } else {
                            deferred.reject();
                        }
                    });
            });

        return deferred.promise;
    }
};
