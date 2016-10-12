
var models;

function getModels(sequelize) {
    if (!models) {
        var Marker = require('./marker')(sequelize);
        var User = require('./user')(sequelize);

        var models = {
            user: User,
            marker: Marker
        };

        Marker.hasOne(User, { foreignKey: 'createdBy' });
    }

    return;
}

module.exports = getModels