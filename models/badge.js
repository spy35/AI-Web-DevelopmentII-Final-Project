const Sequelize = require('sequelize');

module.exports = class Badge extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            requiredCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Badge',
            tableName: 'badges',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Badge.hasMany(db.UserBadge, { foreignKey: 'badgeId', sourceKey: 'id', onDelete: 'CASCADE' });
    }
};
