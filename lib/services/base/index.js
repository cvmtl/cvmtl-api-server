'use strict'

/**
 * Base service class, containing functions
 * common across services
 */
class BaseService {

    constructor(config) {
        this.config = config;
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
    }
}

exports.prototype = BaseService;