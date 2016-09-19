'use strict'

class BaseService {

    constructor(config) {
        this.config = config;
    }

    requireAuth (req, res, next) {
        // TODO
        next();
    }
}

exports.prototype = BaseService;