const os = require('os');

module.exports = {
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
    }
}