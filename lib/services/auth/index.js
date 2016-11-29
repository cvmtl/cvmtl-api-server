const BaseService = require('./../base').prototype;
const passport = require('passport');
const winston = require('winston');

const CorridorsVertsOAuth = require('./oauth-corridorsverts');
const FacebookOAuth = require('./oauth-facebook');
const GoogleOAuth = require('./oauth-google');

/**
 * Authentication service delegating authentication to an
 * oauth2 server.
 */
class AuthenticationService extends BaseService {

    constructor(config, context) {
        super(config, context);

        this.authServices = [];

        this.authServices.push(CorridorsVertsOAuth.instance(config, context));
        this.authServices.push(FacebookOAuth.instance(config, context));
        this.authServices.push(GoogleOAuth.instance(config, context));
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
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            givenName: user.givenName,
            familyName: user.familyName,
            admin: user.admin === true,
            blocked: user.blocked === true
            });
    }

    logout(req, res, next) {
        if (req.user) {
            winston.debug('logout', req.user.id);
            req.logout();
            res.json({
                status: 401,
                message: 'logged out'
            })
        } else {
            res.send({
                status: 200,
                message: 'not logged in'
            });
        }

    }

    initPassport(app) {
        var i;
        app.use(passport.initialize());
        app.use(passport.session());


        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        for (i = 0; i < this.authServices.length; i++) {
            this.authServices[i].initPassport(app);
        }

    }

    initRoutes(app) {
        var i;
        app.get('/auth/logout', this.logout.bind(this));
        app.get('/auth/profile', this.requireAuth, this.userProfile.bind(this));

        for (i = 0; i < this.authServices.length; i++) {
            this.authServices[i].initRoutes(app);
        }

    }
}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new AuthenticationService(config, context);
    }
    return instance;
}
