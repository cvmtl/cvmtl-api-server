const BaseService = require('./../base').prototype;

const Project = require('./../../model/project').getModel();

const winston = require('winston');
// const Promise = require('bluebird');
// const geoJSONValidation = require('geojson-validation');
// const isPolygon = Promise.promisify(geoJSONValidation.isPolygon);

/**
 * Provides an implementation of the Project Web Service
 */
class ProjectService extends BaseService {

    constructor(config, context) {
        super(config, context);
        this.config = config;
    }

    toGeoJSONFeature(result) {
        return {
            type: "Feature",
            geometry: result.area,
            properties: {
                description: result.description,
                title: result.title,
                shortname: result.shortname,
                category: result.category,
                id: result.id
            }
        }
    }

    /**
     * @api {get} /api/projects lists all projects
     * @apiName GetProjects
     * @apiGroup Projects
     *
     */
    listProjects(req, res, next) {
        var whereConditions = [],
            value, limit = 100,
            offset = 0,
            resultType = 'json';

        // get the 'bounding box' parameter which represents
        // the box we want to search within. it should be four
        // decimal values, separated by commas.
        if (req.query.bb) {
            var boundingBox = req.query.bb.split(/,/g);

            whereConditions.push(
                Project.pointInBoundingBox('area', boundingBox)
            );
        }

        if (req.query.max && req.query.max.trim().length > 0) {
            value = parseInt(req.query.max, 10);
            if (!isNaN(value)) {
                limit = value;
            }
        }

        if (req.query.offset && req.query.offset.trim().length > 0) {
            value = parseInt(req.query.offset, 10);
            if (!isNaN(value)) {
                offset = value;
            }
        }

        if (req.query.type && req.query.type === 'geojson') {
            resultType = req.query.type;
        }

        Project.findAll({
            limit: limit,
            offset: offset,
            where: { $and: whereConditions }
        }).then(function(results) {
            var i = 0;
            var items = []
            if (resultType === 'geojson') {
                for (i = 0; i < results.length; i++) {
                    items.push(this.toGeoJSONFeature(results[i]));
                }
            } else {
                for (i = 0; i < results.length; i++) {
                    var description;
                    if (results[i].description !== null) {
                        description = results[i].description;
                    }
                    // We don't include the 'area' here.
                    items.push({
                        id: results[i].id,
                        title: results[i].title,
                        shortname: results[i].shortname,
                        description: description,
                        category: results[i].category,
                        createdBy: results[i].createdBy,
                        createdAt: results[i].createdAt
                    });
                }
            }

            res.json(items);
        }.bind(this));
    }

    /**
     * @api {get} /api/projects/:id returns details of current project
     * @apiName GetProjectDetails
     * @apiGroup Projects
     *
     */
    projectDetails(req, res, next) {
        var projectId = req.params[0];
        var resultType = 'json';

        if (req.query.type && req.query.type === 'geojson') {
            resultType = req.query.type;
        }

        Project.findOne({
            where: { id: projectId }
        }).then(function(item) {
            if (item) {
                if (resultType === 'geojson') {
                    res.json(this.toGeoJSONFeature(item));
                } else {
                    res.json({
                        id: item.id,
                        title: item.title,
                        shortname: item.shortname,
                        description: item.description,
                        area: item.area,
                        category: item.category,
                        createdBy: item.createdBy,
                        createdAt: item.createdAt,
                        //group:
                    });
                }
            } else {
                res.status(404).json({
                    status: 404,
                    message: 'no corresponding project found for id'
                })
            }
        }.bind(this));
    }


    addMultiProject(featureCollection, createdByUserId, req, res, next) {
        let i;
        const features = featureCollection.features;
        const sequelize = Project.sequelize;

        sequelize.transaction({ autocommit: false }).then(function(tx1) {
            var createProjects = [];
            for (i = 0; i < features.length; i++) {
                const geometry = features[i].geometry;
                const properties = features[i].properties;
                let title = properties.title;
                if (!title && properties.nom) {
                    title = properties.nom;
                }

                createProjects.push(Project.create({
                    createdBy: createdByUserId,
                    area: geometry,
                    title: title,
                    shortname: properties.shortname,
                    description: properties.description,
                    category: properties.category
                }, { transaction: tx1 }));
                
            }
            return Promise.all(createProjects).then(function(result) {
                res.json({
                    status: 'ok'
                });
                return tx1.commit();
            }).catch(function(error) {
                return tx1.rollback();
            });
        }.bind(this));

    }

    /**
     * @api {post} /api/projects/ creates a new project
     * @apiName PostProject
     * @apiGroup Projects
     *
     * @apiParam {String} area
     * @apiParam {String} title
     * @apiParam {String} description
     * @apiParam {String} shortname
     */
    addProject(req, res, next) {
        // user, should be valid, since we require authentication to get here

        var userId = req.user.id;
        var geojson = req.body.area;
        var shortname = req.body.shortname;
        var title = req.body.title;
        var description = req.body.description;
        var category = req.body.category;

        if (geojson.type === 'FeatureCollection') {
            this.addMultiProject(geojson, userId, req, res, next);
            return;
        } else if (geojson.type === 'Feature') {
            geojson = geojson.geometry
        } else if (geojson.type !== 'Polygon') {
            winston.error('Not a polygon');
            // TODO return error
        }

        Project.create({
            createdBy: userId,
            area: geojson,
            title: title,
            shortname: shortname,
            description: description,
            category: category
        }).then(function(entry) {
            res.json({
                status: 'ok'
            });
        }).catch(function(error) {
            this.errorResponse(error, req, res);
        }.bind(this));
    }

    /**
     * @api {put} /api/projects/:id updates an exsiting project
     * @apiName PutProject
     * @apiGroup Projects
     *
     * @apiParam {String} id the id of the project to be update
     * @apiParam {String} area
     * @apiParam {String} title
     * @apiParam {String} description
     * @apiParam {String} shortname
     */
    updateMaker(req, res, next) {
        res.json({
            status: 501,
            message: 'not implemented'
        });
    }

    initRoutes(app) {
        app.get(/^\/projects\/?$/, this.listProjects.bind(this));
        app.get(/^\/projects\/([^ /])+/, this.projectDetails.bind(this));
        app.post(/^\/projects\/?/, this.requireAuth.bind(this), this.addProject.bind(this));
        app.put(/^\/projects\/([^ /])+/, this.requireAuth.bind(this), this.updateMaker.bind(this));

        //app.get(/^\/myprojects\/?/, this.requireAuth.bind(this), this.listUserProjects.bind(this));
        //app.get(/^\/myprojects\/([^ \/])+/, this.requireAuth.bind(this), this.userMakerDetails.bind(this));
    }

}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new ProjectService(config, context);
    }
    return instance;
}