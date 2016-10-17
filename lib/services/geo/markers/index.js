'use strict'

var BaseService = require('./../../base').prototype;
var Marker = require('./../../../model/marker')();
var database = require('./../../../model/marker')();

/**
 * Provides an implementation of the Marker Web Service
 */
class MarkerService extends BaseService {

    constructor(config, context) {
        super(config, context);
        this.config = config;
    }

    listMarkers(req, res, next) {
        console.log(req.user);

        var whereConditions = [],
            value, limit = 100,
            offset = 0;

        // get the 'bounding box' parameter which represents
        // the box we want to search within. it should be four
        // decimal values, separated by commas.
        if (req.query.bb) {
            var boundingBox = req.query.bb.split(/\,/g);

            whereConditions.push(
                Marker.pointInBoundingBox('latlon', boundingBox)
            );
        }

        if (req.query.max && req.query.max.trim().length > 0) {
            value = parseInt(req.query.max);
            if (!isNaN(value)) {
                maxCount = value;
            }
        }

        if (req.query.offset && req.query.offset.trim().length > 0) {
            value = parseInt(req.query.offset);
            if (!isNaN(value)) {
                offset = value;
            }
        }

        Marker.findAll({
            limit: limit,
            offset: offset,
            where: { $and: whereConditions }
        }).then(function(results) {
            var i = 0;
            var items = []
            for (i = 0; i < results.length; i++) {
                items.push({
                    id: results[i].id,
                    description: results[i].description,
                    latlon: results[i].latlon,
                    createdBy: results[i].createdBy,
                    createdAt: results[i].createdAt
                        //group:
                        //name:
                });
            }
            res.json(items);
        });
    }

    markerDetails(req, res, next) {
        var id = req.query.id;
        Marker.findOne({ id: id }).then(function(item) {
            res.json({
                id: item.id,
                description: item.description,
                latlon: item.latlon,
                createdBy: item.createdBy,
                createdAt: item.createdAt,
                //group:
            });
        });
    }

    /**
     * Returns markers belonging to the currently authenticated user.
     */
    listUserMarkers(req, res, next) {
        // user, should be valid, since we require authentication to get here
        var user = req.user;
        Marker.findAll({ createdBy: user.id }).then(function(results) {
            var i = 0;
            var items = []
            for (i = 0; i < results.length; i++) {
                items.push({
                    id: results[i].id,
                    description: results[i].description,
                    latlon: results[i].latlon,
                    createdBy: results[i].createdBy,
                    createdAt: results[i].createdAt
                });
            }
            res.json(items);
        });
    }

    /**
     * Returns details on a marker belonging to the currently
     * authenticated user.
     */
    userMakerDetails(req, res, next) {
        // user, should be valid, since we require authentication to get here
        var user = req.user;
        var id = req.query.id;
        Marker.findOne({ id: id, createdBy: user.id }).then(function(item) {
            res.json({
                id: item.id,
                description: item.description,
                latlon: item.latlon,
                createdBy: item.createdBy,
                createdAt: item.createdAt
            });
        });
    }

    /**
     * Adds a marker. If no layer is specified,
     * then it is added to the user's own collection
     */
    addMarker(req, res, next) {
        // user, should be valid, since we require authentication to get here
        var user = req.user;
        var userId = -1;
        var point = { type: 'Point', coordinates: req.body.latlon };
        var description = req.body.description;
        var scope = this;

        Marker.create({
            createdBy: userId,
            latlon: point,
            description: description
        }).then(function(entry) {
            res.json({
                status: 'ok'
            });
        }).catch(function(error) {
            console.log('error', error);
            scope.errorResponse(error, req, res);
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
        app.get(/^\/geo\/markers$/, this.requireAuth, this.listMarkers.bind(this));
        app.get(/^\/geo\/\markers\/([^ \/])+/, this.requireAuth, this.markerDetails.bind(this));
        app.post(/^\/geo\/\markers/, this.requireAuth, this.addMarker.bind(this));
        app.put(/^\/geo\/\markers\/([^ \/])+/, this.addMarker, this.updateMaker.bind(this));

        app.get(/^\/geo\/mymarkers/, this.requireAuth, this.listUserMarkers.bind(this));
        app.get(/^\/geo\/mymarkers\/([^ \/])+/, this.requireAuth, this.userMakerDetails.bind(this));
    }

}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new MarkerService(config, context);
    }
    return instance;
}