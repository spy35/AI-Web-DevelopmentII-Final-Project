const Sequelize = require('sequelize');

module.exports = class UserBadge extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            isEquipped: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'UserBadge',
            tableName: 'user_badges',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.UserBadge.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id', onDelete: 'CASCADE' });
        db.UserBadge.belongsTo(db.Badge, { foreignKey: 'badgeId', targetKey: 'id', onDelete: 'CASCADE' });
    }
};
