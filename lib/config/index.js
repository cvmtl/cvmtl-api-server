const winston = require('winston')
const os = require('os');

var baseConfig = {
    appName: 'cvmtl api server',
    appVersion: '0.0.1',
    projectUrl: 'http://github.com/cvmtl/cvmtl-api-server',
    apiVersion: '0',
    listeningPort: 7070,
    keystorePath: [os.homedir(), '.cvmtl-key-store'].join('/'),
    permittedReferrers: {
        DEFAULT: /^localhost/,
        DEV: /^.*\.corridorsvertsmtl\.org/,
        PROD: /^.*\.corridorsvertsmtl\.org/
    },
    database: {
        url: 'mysql://cvmtl:devpass@localhost:3306/cvmtl',
        options: {}
    },
    logging: {
        options: {
            timestamp: true,
            level: 'debug',
            colorize: true
        }
    }
}

var nodeEnv = process.env.NODE_ENV;
if (!nodeEnv) {
    nodeEnv = 'default';
}

nodeEnv = nodeEnv.toLowerCase();

if (nodeEnv !== 'default') {
    try {
        module.exports = Object.assign(baseConfig, require(`./${nodeEnv}`));
        winston.info(`using server configuration for '${process.env.NODE_ENV}' environment`);
        return;
    } catch (error) {
        winston.info(`No configuration found for ${nodeEnv}, will use default`);
    }
}

winston.info(`using server default configuration`);

module.exports = baseConfig;