const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: Sequelize.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(255),
                allowNull: true,
                defaultValue: '',
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'User',
            tableName: 'users',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.User.hasMany(db.Routine, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' });
        db.User.hasMany(db.RoutineLog, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' });
        db.User.hasMany(db.Challenge, { foreignKey: 'creatorId', sourceKey: 'id', onDelete: 'CASCADE' });
        db.User.hasMany(db.Participant, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' });
        db.User.hasMany(db.Comment, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' });
        db.User.hasMany(db.UserBadge, { foreignKey: 'userId', sourceKey: 'id', onDelete: 'CASCADE' });
    }
};
