const BaseService = require('./../base').prototype;
const keystore = require('./../keystore');
const passport = require('passport');
const winston = require('winston');

//const ExternalUser = require('./../../model')().externalUser;
//const User = require('./../../model')().user;

/**
 * Authentication service delegating authentication to an
 * oauth2 server.
 */
class CorridorsVertsOAuthService extends BaseService {

    constructor(config, context) {
        super(config, context);

        this.oauthConfig = keystore.get('wp-oauth');
        this.enabled = (this.oauthConfig !== undefined);

        if (!this.enabled) {
            winston.warn('No oauth configuration for CVMTL WordPress. Will disable');
        }

    }


    register(req, res, next) {
        // var email = req.body.email;
        // var username = req.body.username;
        // var password = req.body.password;

        // TODO check email not in database
        // TODO check username not in database
        // TODO validate password format
        // TODO send confirmation e-mail
    }

    confirmToken(req, res, next) {
        // var userId = req.body.userid;
        // var token = req.body.token;

        // TODO search database for user
        // TODO validate token
    }

    login(req, res, next) {
        // var username = req.body.username;
        // var password = req.body.password;

        // TODO find user matching username and password
    }

    resetPassword(req, res, next) {
        // var userId = req.body.userid;
        // var token = req.body.token;
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


    }

    initRoutes(app) {
        if (!this.isEnabled()) {
            return;
        }

        //app.get('/auth/local', this.authenticate.bind(this));
        //app.get('/auth/local/callback', this.handleCallback.bind(this));
    }
}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new CorridorsVertsOAuthService(config, context);
    }
    return instance;
}