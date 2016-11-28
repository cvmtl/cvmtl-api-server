const winston = require('winston');

/**
 * Base service class, containing functions
 * common across services
 */
class BaseService {

    constructor(config, context) {
        this.config = config;
        if (context) {
            this.context = context;
        }
    }

    dummyUser() {
    //     return {
    //         'id': 1,
    //         'username': 'darwin',
    //         'email': 'not.a.real.user@example.com',
    //         'displayName': 'Charles Darwin',
    //         'givenName': 'Charles',
    //         'familyName': 'Darwin',
    //         'admin': false,
    //         'blocked': false,
    //         'createdAt': '2016-10-17T16:10:41.000Z',
    //         'updatedAt': '2016-10-17T16:10:41.000Z'
    //     }
    // }

    requireAuth(req, res, next) {
        // for development purposes only
        // req.user = this.dummyUser();
        // next();
        if (req.isAuthenticated()) {
            return next();
        }

        res.status(401).json({
            status: 401,
            message: "authorization required"
        })
    }

    errorResponse(error, req, res) {
        res.status(500).json({
            status: 500,
            error: error
        });
        winston.error(error, error.message, error.stack)
    }
}

exports.prototype = BaseService;
