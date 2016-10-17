'use strict'

var BaseService = require('./../../base').prototype;
var Marker = require('./../../../model/marker');

/**
 * Provides an implementation of the Map Web Service
 */
class MapService extends BaseService {

    constructor(config, context) {
        super(config, context);
    }

    listMaps(req, res, next) {
        res.json([{
            id: '123f14af80bd14',
            name: 'Fred Pasteur',
            url: 'https://anagraph.carto.com/api/v2/viz/bd20a288-5a7d-11e6-85cb-0e3ff518bd15/viz.json',
            service: 'carto',
            type: 'layer'
        }]);
    }

    mapDetails(req, res, next) {
        res.json({
            id: '123f14af80bd14',
            name: 'Fred Pasteur',
            url: 'https://anagraph.carto.com/api/v2/viz/bd20a288-5a7d-11e6-85cb-0e3ff518bd15/viz.json',
            service: 'carto',
            type: 'layer'
        });
    }

    initRoutes(app) {
        app.get(/\/geo\/maps/, this.requireAuth, this.listMaps.bind(this));
        app.get(/\/geo\/maps\/([^ \/])+/, this.requireAuth, this.mapDetails.bind(this));
    }

}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new MapService(config, context);
    }
    return instance;
}