'use strict'

const bodyParser = require("body-parser");
const express = require('express');
const expressSession = require('express-session');
const url = require('url');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

const config = require('./config');
const keystore = require('./services/keystore');
//const router = rquire('./router');
const mapService = require('./services/geo/maps');
const markerService = require('./services/geo/markers');
const userService = require('./services/user');
const authService = require('./services/auth');


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

    var oauthConfig = keystore.get('wpOauth');
    console.log('---', oauthConfig)
    passport.use(new OAuth2Strategy(oauthConfig, //{
        //     authorizationURL: oauthConfig.'https://www.example.com/oauth2/authorize',
        //     tokenURL: 'https://www.example.com/oauth2/token',
        //     clientID: EXAMPLE_CLIENT_ID,
        //     clientSecret: EXAMPLE_CLIENT_SECRET,
        //     callbackURL: oauthConfig.callbackUrl //"http://localhost:3000/auth/example/callback"
        // },
        function(accessToken, refreshToken, profile, callback) {
            console.log('profile', profile);
            callback(undefined, {
                id: '56757dsfe22',
                email: 'dummy@example.com'
            });
        }
    ));
}

function handleIsAuthenticated(req, res, next) {
    console.log('xxxx', 'handleIsAuthenticated');
    passport.authenticate('oauth2')(req, res, next);
}

function authorize(req, res, next) {
    console.log('xxxx', 'authorize');
    passport.authenticate('oauth2')(req, res, next);
}

function initRoutes(app) {

    app.get(/.*/, handleIsApiAuthorised);
    app.get(/.*/, handleIsAuthenticated);

    app.get('/auth/example', passport.authenticate('oauth2'));
    app.get('/auth/callback',
        passport.authenticate('oauth2', { failureRedirect: '/api/login' }),
        function(req, res) {
            console.log('success');
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    mapService.instance(config).initRoutes(app);
    markerService.instance(config).initRoutes(app);
    userService.instance(config).initRoutes(app);

    app.get('/', handleApiVersion);
}

function init() {
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

init();