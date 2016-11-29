const Promise = require('bluebird');
const Sequelize = require('sequelize');
const config = require('./config');
const model = require('./model');
const winston = require('winston');
const keystore = require('./services/keystore');

function initDatabase() {
    var sequelize;

    Object.assign(config.database.options, {
        logging: winston.debug
    });

    var databaseUrl = config.database.url;
    var databaseName = config.database.name;
    var databaseUser = config.database.username;
    var databasePass = config.database.password;

    // Check the keystore, in case those values are there

    if (keystore.get('database')) {
        var entry = keystore.get('database')
        if (entry.url) {
            databaseUrl = entry.url;
        } else if (entry.name) {
            databaseName = entry.name;
            databaseUser = entry.username;
            databasePass = entry.password;
        }
    }

    if (config.database) {
        if (databaseUrl) {
            sequelize = new Sequelize(databaseUrl, config.database.options);
        } else {
            sequelize = new Sequelize(
                databaseName,
                databaseUser,
                databasePass,
                config.database.options
            );
        }
    } else {
        throw Error("no database configuration available");
    }

    winston.debug('sequelize: ', sequelize !== undefined);
    model.getModel(sequelize);

    if (config.database.readOnlySchema !== true) {
        return sequelize.sync().then(function() {
            return sequelize;
        });

    }

    return new Promise(function(resolve, reject) {
        resolve(sequelize);
        return sequelize;
    });
}

module.exports.init = initDatabase;