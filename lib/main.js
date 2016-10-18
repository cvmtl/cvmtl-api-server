'use strict'

const bodyParser = require("body-parser");
const express = require('express');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');

const url = require('url');
const config = require('./config');
const keystore = require('./services/keystore');

const database = require('./database');

var authService;
var mapService;

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

function initRoutes(app, config, context) {

    app.get(/.*/, handleIsApiAuthorised);

    const userService = require('./services/user');
    const projectService = require('./services/projects');
    const mapService = require('./services/geo/maps');

    userService.instance(config, context).initRoutes(app);
    authService.instance(config, context).initRoutes(app);

    mapService.instance(config, context).initRoutes(app);
    projectService.instance(config, context).initRoutes(app);

    app.get('/', handleApiVersion);

    var i;
    if (app.stack) {
        console.log('debug', 'Registered paths:');
        for (i = 0; i < app.stack.length; i++) {
            console.log('debug', '  ' + app.stack[i].regexp, app.stack[i].route.methods);
        }
    }
}

function initWebServices(context) {
    var app = express();
    var router = express.Router();


    app.use(cookieParser(keystore.get('expressSession')));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // TODO see: express-mysql-session
    app.use(expressSession({
        secret: keystore.get('expressSession'),
        resave: true,
        saveUninitialized: true,
        cookie: { secure: 'auto' }
    }));

    authService.instance(config).initPassport(app);

    app.use('/api/', router);

    app.get('/', handleAppVersion);

    initRoutes(router, config, context);

    app.use(function(error, req, res, next) {
        var message = error;
        if (typeof error !== 'String') {
            message = error.message
        }

        console.log('error', req.url, error);

        res.status(500).json({
            status: 500,
            message: message
        })
    });

    console.log(`Starting \'${config.appName}\', version ${config.appVersion}`);

    app.listen(config.listeningPort);
    console.log(`Listening on port ${config.listeningPort}, since ${new Date()}`);
}

database.init().then(function(sequelize) {
    var context = {};
    context.sequelize = sequelize;

    authService = require('./services/auth');
    mapService = require('./services/geo/maps');

    return initWebServices(context);
}).catch(function(error) {
    console.log(error);
})