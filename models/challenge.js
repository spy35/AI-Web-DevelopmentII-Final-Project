const Sequelize = require('sequelize');

module.exports = class Challenge extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Challenge',
            tableName: 'challenges',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Challenge.belongsTo(db.User, { foreignKey: 'creatorId', targetKey: 'id', onDelete: 'CASCADE' });
        db.Challenge.hasMany(db.Participant, { foreignKey: 'challengeId', sourceKey: 'id', onDelete: 'CASCADE' });
        db.Challenge.hasMany(db.Comment, { foreignKey: 'challengeId', sourceKey: 'id', onDelete: 'CASCADE' });
    }
};
