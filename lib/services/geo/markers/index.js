'use strict'

var BaseService = require('./../../base').prototype;

/**
 * Provides an implementation of the Marker Web Service
 */
class MarkerService extends BaseService {

    constructor(config) {
        super(config);
        this.config = config;
    }

    listMarkers(req, res, next) {
        res.json([{
            id: '123e14af89bd14',
            name: 'mon  marqueur',
            details: 'details sur mon marqueur',
            latlon: [45.5017, 73.5673],
            group: 'personal',
            createdBy: '52ae16cf89bda9'
        }]);
    }

    markerDetails(req, res, next) {
        res.json({
            id: '123e14af89bd14',
            name: 'mon  marqueur',
            details: 'details sur mon marqueur',
            latlon: [45.5017, 73.5673],
            group: 'Verdissement 2016',
            createdBy: '52ae16cf89bda9'
        });
    }

    listUserMarkers(req, res, next) {
        res.json([{
            id: '123e14af89bd14',
            name: 'mon  marqueur',
            details: 'details sur mon marqueur',
            latlon: [45.5017, 73.5673],
            createdBy: '52ae16cf89bda9'
        }]);
    }

    /**
     * Returns details on a marker belonging
     * to the currently authenticated user
     */
    userMakerDetails(req, res, next) {
        res.json({
            id: '123e14af89bd14',
            name: 'mon  marqueur',
            details: 'details sur mon marqueur',
            latlon: [45.5017, 73.5673],
            createdBy: '52ae16cf89bda9'
        });
    }

    /**
     * Adds a marker. If no layer is specified,
     * then it is added to the user's own collection
     */
    addMarker(req, res, next) {
        res.json({
            status: 501,
            message: 'not implemented'
            });
    }

    /**
     * Updates a marker. This can only be done
     * to markers that the user is authorised
     * to update.
     */
    updateMaker(req, res, next) {
        res.json({
            status: 501,
            message: 'not implemented'
            });
    }

    initRoutes(app) {
        app.get(/\/geo\/markers/, this.requireAuth, this.listMarkers.bind(this));
        app.get(/\/geo\/\markers\/([^ \/])+/, this.requireAuth, this.markerDetails.bind(this));
        app.post(/\/geo\/\markers/, this.addMarker, this.addMarker.bind(this));
        app.put(/\/geo\/\markers\/([^ \/])+/, this.addMarker, this.updateMaker.bind(this));

        app.get(/\/geo\/mymarkers/, this.requireAuth, this.listUserMarkers.bind(this));
        app.get(/\/geo\/mymarkers\/([^ \/])+/, this.requireAuth, this.userMakerDetails.bind(this));
    }

}

var instance;

exports.instance = function (config) {
    if (!instance) {
        instance = new MarkerService(config);
    }
    return instance;
}