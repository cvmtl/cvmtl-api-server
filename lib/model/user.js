/**
 * @module model/user
 */
const Sequelize = require('sequelize');

var user;

/**
 * Defines a user within the application
 */
function getModel(sequelize) {
    if (!user) {
        user = sequelize.define('user', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            username: Sequelize.STRING,
            email: Sequelize.STRING,
            displayName: Sequelize.STRING,
            givenName: Sequelize.STRING,
            familyName: Sequelize.STRING,
            admin: Sequelize.BOOLEAN,
            blocked: Sequelize.BOOLEAN
        }, {
            timestamps: true
        });
    }

    return user;
}

module.exports.getModel = getModel;