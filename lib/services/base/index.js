'use strict'

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

    requireAuth(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.status(501).json({
            status: 501,
            message: "authorization required"
        })
    }

    errorResponse(error, req, res) {
        res.json({
            status: 500,
            error: error
        });
        console.log('error', error, error.message, error.stack)
    }
}

exports.prototype = BaseService;