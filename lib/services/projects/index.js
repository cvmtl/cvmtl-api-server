'use strict'

var BaseService = require('./../base').prototype;
var Project = require('./../../model/project')();

/**
 * Provides an implementation of the Project Web Service
 */
class ProjectService extends BaseService {

    constructor(config, context) {
        super(config, context);
        this.config = config;
    }

    listProjects(req, res, next) {
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
                Project.pointInBoundingBox('latlon', boundingBox)
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

        Project.findAll({
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

    projectDetails(req, res, next) {
        var id = req.query.id;
        Project.findOne({ id: id }).then(function(item) {
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
     * Returns projects belonging to the currently authenticated user.
     */
    listUserProjects(req, res, next) {
        // user, should be valid, since we require authentication to get here
        var user = req.user;
        Project.findAll({ createdBy: user.id }).then(function(results) {
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
     * Returns details on a project belonging to the currently
     * authenticated user.
     */
    userMakerDetails(req, res, next) {
        // user, should be valid, since we require authentication to get here
        var user = req.user;
        var id = req.query.id;
        Project.findOne({ id: id, createdBy: user.id }).then(function(item) {
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
     * Adds a project. If no layer is specified,
     * then it is added to the user's own collection
     */
    addProject(req, res, next) {
        // user, should be valid, since we require authentication to get here
        var user = req.user;
        var userId = req.user.id;

        console.log('data', req.body)

        var latlon = req.body.latlon;
        latlon[0] = parseFloat(latlon[0]);
        latlon[1] = parseFloat(latlon[1]);

        var point = Project.point(latlon); //{ type: 'Point', coordinates: req.body.latlon };
        var description = req.body.description;
        var scope = this;

        Project.create({
            createdBy: userId,
            latlon: point,
            description: description
        }).then(function(entry) {
            res.json({
                status: 'ok'
            });
        }).catch(function(error) {
            scope.errorResponse(error, req, res);
        });
    }

    /**
     * Updates a project. This can only be done
     * to projects that the user is authorised
     * to update.
     */
    updateMaker(req, res, next) {
        res.json({
            status: 501,
            message: 'not implemented'
        });
    }

    initRoutes(app) {
        app.get(/^\/projects$/, this.requireAuth, this.listProjects.bind(this));
        app.get(/^\/\projects\/([^ \/])+/, this.requireAuth, this.projectDetails.bind(this));
        app.post(/^\/\projects/, this.requireAuth, this.addProject.bind(this));
        app.put(/^\/\projects\/([^ \/])+/, this.addProject, this.updateMaker.bind(this));

        app.get(/^\/myprojects/, this.requireAuth, this.listUserProjects.bind(this));
        app.get(/^\/myprojects\/([^ \/])+/, this.requireAuth, this.userMakerDetails.bind(this));
    }

}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new ProjectService(config, context);
    }
    return instance;
}