'use strict'

const bodyParser = require("body-parser");
const express = require('express');

const config = require('./config');
//const router = rquire('./router');
const mapService = require('./services/geo/maps');
const markerService = require('./services/geo/markers');
const userService = require('./services/user');


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

function initRoutes(app) {
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
    app.use('/api/', router);

    app.get('/',handleAppVersion);
    initRoutes(router);

    console.log(`Starting \'${config.appName}\', version ${config.appVersion}`);

    app.listen(config.listeningPort);
    console.log(`Listening on port ${config.listeningPort}`);
}

init();