const Sequelize = require('sequelize');

module.exports = class RoutineLog extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            checkDate: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'DONE',
            },
            memo: {
                type: Sequelize.STRING(255),
                allowNull: true,
                defaultValue: '',
            },
        }, {
            sequelize,
            timestamps: false,
            modelName: 'RoutineLog',
            tableName: 'routine_logs',
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }

    static associate(db) {
        db.RoutineLog.belongsTo(db.Routine, { foreignKey: 'routineId', targetKey: 'id', onDelete: 'CASCADE' });
        db.RoutineLog.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'id', onDelete: 'CASCADE' });
    }
};
