/**
 * @module model/group
 */
const Sequelize = require('sequelize');

var group;

/**
 * Defines a group
 */
function getModel(sequelize) {
    if (!group) {
        group = sequelize.define('group', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            groupname: Sequelize.STRING,
            purpose: Sequelize.TEXT
        }, {
            timestamps: true
        });
    }

    return group;
}

module.exports.getModel = getModel;