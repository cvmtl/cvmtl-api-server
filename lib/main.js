'use strict'

const bodyParser = require("body-parser");
const express = require('express');
const expressSession = require('express-session');
const url = require('url');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const WPOAuthStrategy = require('passport-wpoauth');

const config = require('./config');
const keystore = require('./services/keystore');
//const router = rquire('./router');
const mapService = require('./services/geo/maps');

const database = require('./database');

function getEnvMode() {
    var mode = process.env.CVMTL_API_ENV;
    if (!mode) {
        mode = 'DEFAULT';
    }
    return mode;
}

function isLocalhost(hostname) {
    return (hostname === 'localhost' ||
        hostname === '::1' ||
        hostname === '127.0.0.1'
    );
}

/**
 * Respond with application details
 */
function handleAppVersion(req, res) {
    res.json({
        name: config.appName,
        version: config.appVersion,
        projectUrl: config.projectUrl
    });
}

function handleApiVersion(req, res) {
    res.json({
        apiVersion: config.apiVersion,
    });
}

/**
 * Tests to see if the requesting service is authorised
 * to use the API server.
 * 
 */
function handleIsApiAuthorised(req, res, next) {
    // TODO we should probably associate the referrer with a key
    // TODO we support an array of referrers

    var authorized = false;
    var mode = getEnvMode();
    var referrers = config.permittedReferrers[mode];

    // if we aren't localhost, then requests are coming
    // from beyond the server and we should check that
    // they are authorized to use the API server

    if (isLocalhost(req.hostname)) {
        var referer = req.headers['referer'];
        if (referer) {
            var refererHost = url.parse(referer).host;
            authorized = isLocalhost(refererHost);
        }
        authorized = true;
    } else {
        var referer = req.headers['referer'];
        if (referer) {
            var refererHost = url.parse(referer).host;
            if (!Array.isArray(referrers)) {
                console.log(typeof referrers)
                if (referrers instanceof RegExp) {
                    authorized = (refererHost.match(referrers))
                } else {
                    authorized = (referrers === refererHost);
                }
            }
        }
    }

    if (!authorized) {
        res.status(401).json({
            status: 401,
            message: 'unauthorized to use API'
        });
        return;
    }

    // All is good, let's continue processing
    next();
}

function initPassport(app) {

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    var oauthConfig = keystore.get('wpOauth');

    passport.use(new WPOAuthStrategy(oauthConfig,
        function(accessToken, refreshToken, profile, callback) {
            console.log('profile', profile);
            callback(undefined, {
                id: '56757dsfe22',
                email: 'dummy@example.com'
            });
        }
    ));

    passport.use(new OAuth2Strategy(oauthConfig,
        function(accessToken, refreshToken, profile, callback) {
            console.log('profile', profile);
            callback(undefined, {
                id: '56757dsfe22',
                email: 'dummy@example.com'
            });
        }
    ));
}

function handleAuthenticate(req, res, next) {
    if (req.path === '/') {
        next();
        return;
    }
    passport.authenticate('oauth2')(req, res, next);
}

function initRoutes(app) {

    app.get(/.*/, handleIsApiAuthorised);

    // app.get(/.*/, handleAuthenticate);

    // app.get('/auth/example', handleAuthenticate);

    app.get('/auth/callback',
        passport.authenticate('oauth2', { failureRedirect: '/api/login' }),
        function(req, res) {
            console.log('success');
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    const markerService = require('./services/geo/markers');
    const userService = require('./services/user');
    const authService = require('./services/auth');

    mapService.instance(config).initRoutes(app);
    markerService.instance(config).initRoutes(app);
    userService.instance(config).initRoutes(app);

    app.get('/', handleApiVersion);
}

function initWebServices() {
    var app = express();
    var router = express.Router();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(expressSession({
        secret: keystore.get('expressSession'),
        resave: true,
        saveUninitialized: true
    }));

    initPassport(app);

    app.use('/api/', router);

    app.get('/', handleAppVersion);
    initRoutes(router);

    console.log(`Starting \'${config.appName}\', version ${config.appVersion}`);

    app.listen(config.listeningPort);
    console.log(`Listening on port ${config.listeningPort}`);
}

database.init().then(function() {
    return initWebServices();
}).catch(function(error) {
    console.log(error);
})