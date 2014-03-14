var gapis = require('googleapis');

var CLIENT_ID = '389328904191.apps.googleusercontent.com';
var CLIENT_SECRET = '3jTDE6VQJmr6RtUkTkA4x9hb';

// TODO: Replace with production URL
var REDIRECT_URL = 'http://127.0.0.1:1337/account/auth';

var oauth2Client = new gapis.OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

module.exports = {
    auth : function  (req, res) {
        var tokens = req.body;

        tokens.expires_in = parseInt(tokens.expires_in, 10);

        oauth2Client.setCredentials(tokens);

        gapis
            .discover('plus', 'v1')
            .execute(function(err, client) {
                client
                    .plus.people.get({ userId: 'me' })
                    .withAuthClient(oauth2Client)
                    .execute(function (err, response, body) {
                        if (response.domain === 'wandoujia.com') {
                            res.send(200);
                        } else {
                            res.send(403);
                        }
                    });
            });
    },
    logout : function (req, res) {

    }
};
