'use strict'

var BaseService = require('./../base').prototype;
var User = require('./../../model/user').getModel();

/**
 * Provides an implementation of the User Web Service
 */
class UserService extends BaseService {

    constructor(config, context) {
        super(config, context);
    }

    /**
     * @api {get} /api/user lists all user
     * @apiName GetUsers
     * @apiGroup Users
     *
     */
    listUsers(req, res, next) {
        User.findAll().then(function(results) {
            var i, users = [];
            for (i = 0; i < results.length; i++) {
                users.push({
                    id: results[i].id,
                    username: results[i].username,
                    displayName: results[i].displayName,
                    givenName: results[i].givenName,
                    familyName: results[i].familyName,
                    email: results[i].email
                });
            }
            res.json(users);
        }).catch(function(error) {
            this.errorResponse(error, req, res);
        }.bind(this));
    }

    /**
     * @api {get} /api/user/:id returns details for the specified user
     * @apiName GetUserDetails
     * @apiGroup Users
     *
     */
    userDetails(req, res, next) {
        var userId = req.params[0];
        User.findOne({ where: { id: userId } }).then(function(user) {
            res.json({
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                givenName: user.givenName,
                familyName: user.familyName,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });
        }).catch(function(error) {
            this.errorResponse(error, req, res);
        }.bind(this));
    }

    /**
     * @api {get} /api/user/:id returns details for the specified user
     * @apiName GetUserDetails
     * @apiGroup Users
     *
     */
    loggedUserDetails(req, res, next) {
        var userId = req.user.id;
        User.findOne({ where: { id: userId } }).then(function(user) {
            res.json({
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                givenName: user.givenName,
                familyName: user.familyName,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });
        }).catch(function(error) {
            this.errorResponse(error, req, res);
        }.bind(this));
    }

    initRoutes(app) {
        app.get(/^\/users$/, this.requireAuth, this.listUsers.bind(this));
        app.get(/^\/users\/me$/, this.requireAuth, this.loggedUserDetails.bind(this));
        app.get(/^\/users\/([^ /])+/, this.requireAuth, this.userDetails.bind(this));
    }

}

var instance;

exports.instance = function(config, context) {
    if (!instance) {
        instance = new UserService(config, context);
    }
    return instance;
}
