/**
 * @module model/group-member
 */
const Sequelize = require('sequelize');

var groupMember;

/**
 * Defines a user as a member of a group
 */
function getModel(sequelize) {
    if (!groupMember) {
        groupMember = sequelize.define('groupMember', {
            groupId: Sequelize.INTEGER,
            userId: Sequelize.INTEGER
        }, {
            timestamps: true
        });
    }

    return groupMember;
}

module.exports.getModel = getModel;