var BaseService = require('./../base').prototype;
const keystore = require('./../keystore');
const passport = require('passport');
const WPOAuthStrategy = require('passport-wpoauth');

const ExternalUser = require('./../../model')().externalUser;
const User = require('./../../model')().user;

/**
 * Authentication service delegating authentication to an
 * oauth2 server.
 */
class AuthenticationService extends BaseService {

    constructor(config, context) {
        super(config, context);

        console.log(require('./../../model')());
    }

    getExternalUserRef() {
        return undefined;
    }

    isAuthenticated() {
        return false;
    }

    userProfile(req, res, next) {
        var user = req.user;
        res.json(user);
    }

    authenticateWithWordpress(req, res, next) {
        passport.authenticate('wpoauth', {
            scope: []
        })(req, res, next);
    }

    wordpressCallbackHandler(req, res, next) {

        try {
            return passport.authenticate('wpoauth', {
                successRedirect: '/api/auth/profile',
                failureRedirect: '/login'
            })(req, res, next);
        } catch (ex) {
            console.log('xxxx ', ex);
            this.errorResponse(ex, req, res);
        }
    }

    logout(req, res, next) {
        console.log('xxx')
        if (req.user) {
            console.log('debug', 'logout', req.user.id);
            req.logout();
        } else {
            res.send({
                status: 200,
                message: 'not logged in'
            });
        }

    }

    initPassport(app) {
        app.use(passport.initialize());
        app.use(passport.session());

        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            console.log('---x', user);
            done(null, user);
        });

        var oauthConfig = keystore.get('wpOauth');

        passport.use(new WPOAuthStrategy(oauthConfig,
            function(accessToken, refreshToken, profile, callback) {
                // TODO handle storing of 'external' user profiles
                //      in the database or simply assume wordpress
                //      will be only authority?  
                var user;

                ExternalUser.findOne({
                    externalId: profile.id,
                    externalAuth: profile.provider
                }).then(function(externalUser) {
                    if (!externalUser) {
                        return User.create({
                            displayName: profile.displayName,
                            givenName: profile.name.givenName,
                            familyName: profile.name.familyName,
                            username: profile.username,
                            email: profile.emails[0].value
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

        app.get('/auth/logout', this.logout.bind(this));
        app.get('/auth/profile', this.requireAuth, this.userProfile.bind(this));
        app.get('/auth/wordpress', this.authenticateWithWordpress.bind(this));
        app.get('/auth/wordpress/callback', this.wordpressCallbackHandler.bind(this));

    }
}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new AuthenticationService(config, context);
    }
    return instance;
}