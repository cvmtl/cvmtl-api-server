const OAuthBaseService = require('./oauth-baseservice').prototype;
const keystore = require('./../keystore');
const passport = require('passport');
const FacebookOAuthStrategy = require('passport-facebook');
const winston = require('winston');

/**
 * Authentication service delegating authentication to the
 * Facebook oauth2 server.
 */
class FacebookOAuthService extends OAuthBaseService {

    // ref: https://developers.facebook.com/docs/facebook-login/web/
    // ref: https://developers.facebook.com/apps/
    // ref: https://developers.facebook.com/docs/facebook-login/permissions/

    constructor(config, context) {
        super(config, context);

        this.oauthConfig = keystore.get('facebook-oauth');
        this.enabled = (this.oauthConfig !== undefined);

        if (!this.enabled) {
            winston.warn('No oauth configuration for Facebook. Will disable');
        }

        if (this.oauthConfig) {
            Object.assign(this.oauthConfig, {
                profileFields: ['id', 'displayName', 'photos', 'email', 'name']
            })
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
        passport.authenticate('facebook', {
            //authType: 'rerequest'
            scope: ['public_profile']
        })(req, res, next);
    }

    handleCallback(req, res, next) {
        try {
            return passport.authenticate('facebook', {
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

        passport.use(new FacebookOAuthStrategy(this.oauthConfig, this.handleTokensAndProfile.bind(this)));
    }

    initRoutes(app) {
        if (!this.isEnabled()) {
            return;
        }

        app.get('/auth/facebook', this.authenticate.bind(this));
        app.get('/auth/facebook/callback', this.handleCallback.bind(this));
    }
}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new FacebookOAuthService(config, context);
    }
    return instance;
}
