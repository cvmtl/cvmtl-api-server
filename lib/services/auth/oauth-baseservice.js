const Promise = require('bluebird');
const winston = require('winston');

const BaseService = require('./../base').prototype;
const ExternalUser = require('./../../model/external-user').getModel();
const User = require('./../../model/user').getModel();

class OAuthBaseService extends BaseService {

    syncProfile(profile, user) {
        if (profile.email !== user.email || profile.displayName !== user.displayName ||
            profile.givenName !== user.givenName || profile.familyName !== user.familyName ||
            profile.username !== profile.username) {

            var email, givenName, familyName;

            if (profile.emails && profile.emails.length > 0) {
                email = profile.emails[0].value;
            }

            if (profile.name) {
                givenName = profile.name.givenName;
                familyName = profile.name.familyName;
            }

            return user.update({
                displayName: profile.displayName,
                givenName: givenName,
                familyName: familyName,
                username: profile.username,
                email: email
            });
        } else {
            return Promise.resolve(user);
        }
    }

    handleTokensAndProfile(accessToken, refreshToken, profile, callback) {
        var user, email, givenName, familyName, scope = this;

        winston.debug('handleTokensAndProfile', profile);

        if (profile.emails && profile.emails.length > 0) {
            email = profile.emails[0].value;
        }

        if (profile.name) {
            givenName = profile.name.givenName;
            familyName = profile.name.familyName;
        }

        ExternalUser.findOne({
            where: {
                externalId: profile.id,
                externalAuth: profile.provider
            }
        }).then(function(externalUser) {
            if (!externalUser) {
                return User.create({
                    displayName: profile.displayName,
                    givenName: givenName,
                    familyName: familyName,
                    username: profile.username,
                    email: email
                }).then(function(newUser) {
                    user = newUser;
                    return ExternalUser.create({
                        externalId: profile.id,
                        externalAuth: profile.provider,
                        localId: newUser.id
                    });
                }).then(function(externalUser) {
                    return user;
                });
            } else {
                return User.findOne({ where: { id: externalUser.localId } });
            }
        }).then(function(user) {
            return scope.syncProfile(profile, user);
        }).then(function(user) {
            callback(undefined, user);
        }).catch(function(error) {
            winston.error(error);
            callback(error, undefined);
        });
    }
}

exports.prototype = OAuthBaseService;
