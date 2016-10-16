var Sequelize = require('sequelize');

var externalUser;

/**
 * Defines a user that is external to the system
 * and the internal user it is associated with.
 */
function getModel(sequelize) {
    if (!externalUser) {
        externalUser = sequelize.define('externalUser', {
            externalId: Sequelize.STRING,
            externalAuth: Sequelize.STRING,
            localId: Sequelize.INTEGER
        }, {
            timestamps: true
        });
    }

    return externalUser;
}

module.exports = getModel;