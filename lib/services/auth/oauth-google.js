const BaseService = require('./../base').prototype;
const keystore = require('./../keystore');
const passport = require('passport');
const GoogleOAuthStrategy = require('passport-google-oauth2');

const ExternalUser = require('./../../model')().externalUser;
const User = require('./../../model')().user;

/**
 * Authentication service delegating authentication to the
 * Facebook oauth2 server.
 */
class GoogleOAuthService extends BaseService {

    // ref: https://console.developers.google.com/
    // ref: https://developers.google.com/identity/protocols/googlescopes

    constructor(config, context) {
        super(config, context);

        this.oauthConfig = keystore.get('google-oauth');
        this.enabled = (this.oauthConfig !== undefined);
        if (!this.enabled) {
            console.log('warn', 'No oauth configuration for Facebook. Will disable');
        }
    }

    getExternalUserRef() {
        return undefined;
    }

    isEnabled() {
        return this.enabled;
    }

    isAuthenticated() {
        return false;
    }

    authenticate(req, res, next) {
        passport.authenticate('google', {
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        })(req, res, next);
    }

    handleCallback(req, res, next) {
        try {
            return passport.authenticate('google', {
                successRedirect: '/api/auth/profile',
                failureRedirect: '/login'
            })(req, res, next);
        } catch (ex) {
            this.errorResponse(ex, req, res);
        }
    }

    initPassport(app) {
        if (!this.isEnabled()) {
            return;
        }

        passport.use(new GoogleOAuthStrategy(this.oauthConfig,
            function(accessToken, refreshToken, profile, callback) {
                var user;

                var email;
                if (profile.emails && profile.emails.length > 0) {
                    email = profile.emails[0].value;
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
                            givenName: profile.name.givenName,
                            familyName: profile.name.familyName,
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
                        // TODO user service -> create user
                    } else {
                        // TODO
                        return User.findOne({ id: externalUser.id });
                    }
                }).then(function(user) {
                    callback(undefined, user);
                }).catch(function(error) {
                    callback(error, undefined);
                });
            }));
    }

    initRoutes(app) {
        if (!this.isEnabled()) {
            return;
        }

        app.get('/auth/google', this.authenticate.bind(this));
        app.get('/auth/google/callback', this.handleCallback.bind(this));
    }
}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new GoogleOAuthService(config, context);
    }
    return instance;
}