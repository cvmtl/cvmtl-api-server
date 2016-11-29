const Promise = require('bluebird');
const Sequelize = require('sequelize');
const config = require('./config');
const model = require('./model');
const winston = require('winston');

function initDatabase() {
    var sequelize;

    Object.assign(config.database.options, {
        logging: winston.debug
    });

    if (config.database) {
        if (config.database.url) {
            sequelize = new Sequelize(config.database.url, config.database.options);
        } else {
            sequelize = new Sequelize(
                config.database.name,
                config.database.username,
                config.database.password,
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
