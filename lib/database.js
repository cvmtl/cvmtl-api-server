const Promise = require('bluebird');
const Sequelize = require('sequelize');
const config = require('./config');

function initDatabase() {
    var sequelize;

    if (config.database) {
        if (config.database.url) {
            sequelize = new Sequelize(config.database.url);
        } else if (config.database.name) {
            sequelize = new Sequelize(
                config.database.name,
                config.database.username,
                config.database.password
            );
        }
    } else {
        throw Error("no database configuration available");
    }

    var models = require('./model')(sequelize);

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