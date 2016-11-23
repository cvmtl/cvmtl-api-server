const winston = require('winston');

module.exports = {
    keystorePath: ['test-data/cvmtl-key-store'].join('/'),
    logging: {
        transport: winston.transports.File,
        options: {
            timestamp: true,
            level: 'debug',
            colorize: true,
            json: false,
            filename: 'cvmtl.log'
        }
    }
}