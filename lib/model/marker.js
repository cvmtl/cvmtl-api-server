var Sequelize = require('sequelize');

var marker;

function getModel(sequelize) {
    if (!marker) {
        marker = sequelize.define('marker', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            createdBy: Sequelize.INTEGER,
            latlon: 'Point',
            description: Sequelize.TEXT
        }, {
            timestamps: true
        });

    }
    return marker;
}

module.exports = getModel;