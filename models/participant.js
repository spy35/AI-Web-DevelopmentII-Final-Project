const Sequelize = require('sequelize');

module.exports = class Participant extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            score: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Participant',
            tableName: 'challenge_participants',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Participant.belongsTo(db.Challenge, { foreignKey: 'challengeId', targetKey: 'id', onDelete: 'CASCADE' });
        db.Participant.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id', onDelete: 'CASCADE' });
    }
};
