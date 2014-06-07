var path           = require('path');
var Q              = require('q');
var templatesDir   = path.resolve(__dirname, 'templates');
var emailTemplates = require('email-templates');
var nodemailer     = require('nodemailer');
var config         = require('../config');
var emailMapping   = require('./EmailMapping');
var _              = require('underscore');


var transport;
var template;

function getTransport() {
    var deferred = Q.defer();

    if (template) {

        deferred.resolve();
    }
    else {

        emailTemplates(templatesDir, function (err, tmp) {

            if (err) {
                console.log(err);
            }
            else {
                template = tmp;
                transport = nodemailer.createTransport('SMTP', {
                    service: 'Gmail',
                    auth: {
                        user: config.PUBLIC_GMAIL_AUTH.USER,
                        pass: config.PUBLIC_GMAIL_AUTH.PASS
                    }
                });
                deferred.resolve();
            }
        });

    }

    return deferred.promise;
}
var email = {
    send: function (type, opts, localOpts) {

        if (!type || !emailMapping[type]) {

            console.error('not this email type:', type);
            return;
        }

        getTransport().then(function () {
            template(type, opts, function (err, html, text) {
                if (err) {
                    console.log(err);
                }
                else {
                    var local = _.extend(
                        {
                            html: html,
                            generateTextFromHTML: true
                        },
                        emailMapping[type].local,
                        localOpts || {}
                    );

                    transport.sendMail(local, function (err, responseStatus) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(responseStatus.message);
                        }
                    });
                }
            });
        });
    }
};

module.exports = email;
