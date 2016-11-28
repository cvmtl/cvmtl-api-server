/**
 * @module model
 */
var models;

function getModels(sequelize) {
    if (!models) {
        var Project = require('./project').getModel(sequelize);
        var User = require('./user').getModel(sequelize);
        var ExternalUser = require('./external-user').getModel(sequelize);
        var Group = require('./group').getModel(sequelize);
        var GroupMember = require('./group-member').getModel(sequelize);

        Project.hasOne(User, { foreignKey: 'createdBy' });
        ExternalUser.hasOne(User);

        User.belongsToMany(Group, {
            through: GroupMember
                //foreignKey: ['user', '']            
        })

        models = {
            user: User,
            externalUser: ExternalUser,
            project: Project
        };

    }

    return models;
}

module.exports.getModel = getModels