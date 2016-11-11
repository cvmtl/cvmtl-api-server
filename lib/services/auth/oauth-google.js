const OAuthBaseService = require('./oauth-baseservice').prototype;
const keystore = require('./../keystore');
const passport = require('passport');
const GoogleOAuthStrategy = require('passport-google-oauth2');
const winston = require('winston');

/**
 * Authentication service delegating authentication to the
 * Facebook oauth2 server.
 */
class GoogleOAuthService extends OAuthBaseService {

    // ref: https://console.developers.google.com/
    // ref: https://developers.google.com/identity/protocols/googlescopes

    constructor(config, context) {
        super(config, context);

        this.oauthConfig = keystore.get('google-oauth');
        this.enabled = (this.oauthConfig !== undefined);
        if (!this.enabled) {
            winston.warn('No oauth configuration for Facebook. Will disable');
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

        passport.use(new GoogleOAuthStrategy(this.oauthConfig, this.handleTokensAndProfile.bind(this)));

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