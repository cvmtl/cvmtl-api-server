const OAuthBaseService = require('./oauth-baseservice').prototype;
const keystore = require('./../keystore');
const passport = require('passport');
const WPOAuthStrategy = require('passport-wpoauth');

const ExternalUser = require('./../../model')().externalUser;
const User = require('./../../model')().user;

/**
 * Authentication service delegating authentication to an
 * oauth2 server.
 */
class CorridorsVertsOAuthService extends OAuthBaseService {

    constructor(config, context) {
        super(config, context);

        this.oauthConfig = keystore.get('wp-oauth');
        // short term backwards compatibility
        if (!this.oauthConfig) {
            this.oauthConfig = keystore.get('wpOauth');
        }
        this.enabled = (this.oauthConfig !== undefined);

        if (!this.enabled) {
            console.log('warn', 'No oauth configuration for CVMTL WordPress. Will disable');
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
        passport.authenticate('wpoauth', {
            scope: []
        })(req, res, next);
    }

    handleCallback(req, res, next) {

        try {
            return passport.authenticate('wpoauth', {
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

        passport.use(new WPOAuthStrategy(this.oauthConfig, this.handleTokensAndProfile.bind(this)));

    }

    initRoutes(app) {
        if (!this.isEnabled()) {
            return;
        }

        app.get('/auth/wordpress', this.authenticate.bind(this));
        app.get('/auth/wordpress/callback', this.handleCallback.bind(this));
    }
}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new CorridorsVertsOAuthService(config, context);
    }
    return instance;
}