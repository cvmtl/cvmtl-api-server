'use strict'

var BaseService = require('./../base').prototype;

/**
 * Provides an implementation of the User Web Service
 */
class UserService extends BaseService {

    constructor(config) {
        super(config);
        this.config = config;
    }

    listUsers(req, res, next) {
        res.json([{
                id: '123e14af89bd14',
                name: 'Fred Pasteur',
                email: 'fpasteur@terre.planete',
                group: 'cvmtl'
            },{
                id: '1c3e13af89bd14',
                name: 'Marianne Verte',
                email: 'marianne.verte@vdm.org',
                group: 'vdm'
            },{
                id: '1c3e13af89bd14',
                name: 'George Smith',
                email: 'george.c.smith@gmail99.com'
            }]);
    }

    userDetails(req, res, next) {
        res.json({
                id: '123e14af89bd14',
                name: 'Fred Pasteur',
                email: 'fpasteur@terre.planete',
                group: 'cvmtl'
            });
    }

    initRoutes(app) {
        app.get(/\/users/, this.requireAuth, this.listUsers.bind(this));
        app.get(/\/users\/([^ \/])+/, this.requireAuth, this.userDetails.bind(this));
    }

}

var instance;

exports.instance = function (config) {
    if (!instance) {
        instance = new UserService(config);
    }
    return instance;
}