const Sequelize = require('sequelize');

module.exports = class Routine extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            title: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            category: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '건강',
            },
            targetDays: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            isArchived: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'Routine',
            tableName: 'routines',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.Routine.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id', onDelete: 'CASCADE' });
        db.Routine.hasMany(db.RoutineLog, { foreignKey: 'routineId', sourceKey: 'id', onDelete: 'CASCADE' });
    }
};
