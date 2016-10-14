var BaseService = require('./../base').prototype;
const keystore = require('./../keystore');
const passport = require('passport');
const WPOAuthStrategy = require('passport-wpoauth');

/**
 * Authentication service delegating authentication to an
 * oauth2 server.
 */
class AuthenticationService extends BaseService {

    constructor(config) {
        super(config);
        this.config = config;
    }

    getExternalUserRef() {
        return undefined;
    }

    isAuthenticated() {
        return false;
    }

    userProfile(req, res, next) {
        var user = req.user;
        res.json({
            userId: user.id,
            email: user.email
        });
    }

    authenticateWithWordpress(req, res, next) {
        passport.authenticate('wpoauth', {
            scope: []
        })(req, res, next);
    }

    wordpressCallbackHandler(req, res, next) {
        return passport.authenticate('wpoauth', {
            successRedirect: '/api/auth/profile',
            failureRedirect: '/login'
        })(req, res, next);
    }

    logout(req, res, next) {
        req.logout();
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
                //console.log('xxprofile', profile);
                callback(undefined, {
                    id: '56757dsfe22',
                    email: 'dummy@example.com'
                });
            }
        ));
    }

    initRoutes(app) {
        app.get('/auth/logout', this.logout.bind(this));
        app.get('/auth/profile', this.requireAuth, this.userProfile.bind(this));
        app.get('/auth/wordpress', this.authenticateWithWordpress.bind(this));
        app.get('/auth/wordpress/callback', this.wordpressCallbackHandler.bind(this));
    }
}

var instance;

exports.instance = function(config) {
    if (!instance) {
        instance = new AuthenticationService(config);
    }
    return instance;
}