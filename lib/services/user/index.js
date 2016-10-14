'use strict'

var BaseService = require('./../base').prototype;
var User = require('./../../model/user')();

/**
 * Provides an implementation of the User Web Service
 */
class UserService extends BaseService {

    constructor(config) {
        super(config);
        this.config = config;
    }

    listUsers(req, res, next) {
        User.findAll().then(function(results) {
            var i, users = [];
            for (i = 0; i < results.length; i++) {
                users.push({
                    id: results[i].id,
                    firstname: results[i].firstname,
                    lastname: results[i].firstname,
                    email: results[i].email
                });
            }
            res.json(users);
        }).catch(function(error) {
            this.errorResponse(error, req, res);
        }.bind(this));

        // res.json([{
        //     id: '123e14af89bd14',
        //     name: 'Fred Pasteur',
        //     email: 'fpasteur@terre.planete',
        //     group: 'cvmtl'
        // }, {
        //     id: '1c3e13af89bd14',
        //     name: 'Marianne Verte',
        //     email: 'marianne.verte@vdm.org',
        //     group: 'vdm'
        // }, {
        //     id: '1c3e13af89bd14',
        //     name: 'George Smith',
        //     email: 'george.c.smith@gmail99.com'
        // }]);
    }

    userDetails(req, res, next) {
        var userId = req.param[0];
        User.findOne({ id: userId }).then(function(user) {
            res.json({
                    id: user.id,
                    firstname: user.firstname,
                     lastname: user.firstname,
                    email: user.email
            });
        }).catch(function(error) {
            this.errorResponse(error, req, res);
        }.bind(this));
    }

    initRoutes(app) {
        app.get(/\/users/, this.requireAuth, this.listUsers.bind(this));
        app.get(/\/users\/([^ \/])+/, this.requireAuth, this.userDetails.bind(this));
    }

}

var instance;

exports.instance = function(config) {
    if (!instance) {
        instance = new UserService(config);
    }
    return instance;
}