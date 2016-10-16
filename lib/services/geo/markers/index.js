'use strict'

var BaseService = require('./../../base').prototype;
var Marker = require('./../../../model/marker')();

/**
 * Provides an implementation of the Marker Web Service
 */
class MarkerService extends BaseService {

    constructor(config) {
        super(config);
        this.config = config;
    }

    listMarkers(req, res, next) {
        console.log(req.user);

        // get the 'bounding box' parameter which represents
        // the box we want to search within. it should be four
        // decimal values, separated by commas.
        if (req.query.bb) {
            var boundingBox = req.query.bb.split(',')
            if (boundingBox.length === 4) {
                var latlon1 = [boundingBox[0], boundingBox[1]]
                var latlon2 = [boundingBox[2], boundingBox[3]]

                var a = latlon1[0] + latlon1[1];
                var b = latlon2[0] + latlon1[1];
                var c = latlon2[0] + latlon2[1];
                var d = latlon1[0] + latlon2[1];
                var e = latlon1[0] + latlon1[1];

                // TODO need to intrgrate this somehow?

                var fn = "ST_CONTAINS(ST_MakePolygon(ST_GeomFromText('LINESTRING(boundingBox)')";

            }
        }

        // TODO
        var maxCount = 100;
        if (req.query.max && req.query.max.trim().length > 0) {
            value = parseInt(req.query.max);
            if (!isNaN(value)) {
                maxCount = value;
            }
        }

        Marker.findAll({}).then(function(results) {
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
        var point = { type: 'Point', coordinates: [0, 0] };
        var description = req.body.description;

        Marker.create({
            createdBy: userId,
            latlon: point,
            description: description
        }).then(function(entry) {
            res.json({
                status: 'ok'
            });
        }).catch(function(error) {
            res.status(500).json({
                status: 500,
                message: error
            })
        })
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
        app.post(/^\/geo\/\markers/, this.addMarker, this.addMarker.bind(this));
        app.put(/^\/geo\/\markers\/([^ \/])+/, this.addMarker, this.updateMaker.bind(this));

        app.get(/^\/geo\/mymarkers/, this.requireAuth, this.listUserMarkers.bind(this));
        app.get(/^\/geo\/mymarkers\/([^ \/])+/, this.requireAuth, this.userMakerDetails.bind(this));
    }

}

var instance;

exports.instance = function(config) {
    if (!instance) {
        instance = new MarkerService(config);
    }
    return instance;
}