const fs = require('fs');
const config = require('./../../config');
const winston = require('winston');

/**
 * Load a JSON file that represents an unencrypted keystore.
 * Since, the keystore is not encrypted, it should be
 * read-only to the current user.
 */
class KeyStoreService {

    constructor() {
        this.keystore = {};
    }

    loadKeyStore() {
        const path = config.keystorePath;
        try {
            const stat = fs.statSync(path);
            if (stat && stat.isFile()) {
                var data = fs.readFileSync(config.keystorePath, 'utf-8');
                this.keystore = JSON.parse(data);
                return true;
            } else {
                winston.log('warn', `could not stat keystore at ${path}`);
            }
        } catch (error) {
            winston.log('warn', `could not find keystore at ${path}`);
            winston.log('error', error)
            return false;
        }
    }

    get(entryName) {
        if (this.keystore) {
            return this.keystore[entryName];
        }
    }
}

var instance;
if (!instance) {
    instance = new KeyStoreService();
    instance.loadKeyStore();
}

module.exports = instance;