const keystore = require('./../keystore');

/**
 * Authentication service delegating authentication to an
 * oauth2 server.
 */
class AuthenticationService {

    constructor() {
        const wpOauthCredentials = keystore.get('wpOauth');
        console.log('debug', 'wpOauthCredentials', wpOauthCredentials);
    }

    getExternalUserRef() {
        return undefined;
    }

    isAuthenticated() {
        return false;
    }
}

var instance;
if (!instance) {
    instance = new AuthenticationService();
}

module.exports = instance;