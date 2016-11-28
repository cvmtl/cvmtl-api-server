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

        this.corridorsVertsOAuth = CorridorsVertsOAuth.instance(config, context);
        this.facebookOAuth = FacebookOAuth.instance(config, context);
        this.googleOAuth = GoogleOAuth.instance(config, context);
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
        app.use(passport.initialize());
        app.use(passport.session());

        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        this.corridorsVertsOAuth.initPassport(app);
        this.facebookOAuth.initPassport(app);
        this.googleOAuth.initPassport(app);

    }

    initRoutes(app) {

        app.get('/auth/logout', this.logout.bind(this));
        app.get('/auth/profile', this.requireAuth, this.userProfile.bind(this));

        this.corridorsVertsOAuth.initRoutes(app);
        this.facebookOAuth.initRoutes(app);
        this.googleOAuth.initRoutes(app);

    }
}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new AuthenticationService(config, context);
    }
    return instance;
}