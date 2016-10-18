var models;

function getModels(sequelize) {
    if (!models) {
        var Project = require('./project')(sequelize);
        var User = require('./user')(sequelize);
        var ExternalUser = require('./external-user')(sequelize);
        var Group = require('./group')(sequelize);
        var GroupMember = require('./group-member')(sequelize);

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

module.exports = getModels