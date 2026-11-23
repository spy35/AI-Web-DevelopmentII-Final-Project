const Sequelize = require('sequelize');
const User = require('./user');
const Routine = require('./routine');
const RoutineLog = require('./routineLog');
const Challenge = require('./challenge');
const Participant = require('./participant');
const Comment = require('./comment');
const Badge = require('./badge');
const UserBadge = require('./userBadge');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.User = User;
db.Routine = Routine;
db.RoutineLog = RoutineLog;
db.Challenge = Challenge;
db.Participant = Participant;
db.Comment = Comment;
db.Badge = Badge;
db.UserBadge = UserBadge;

User.init(sequelize);
Routine.init(sequelize);
RoutineLog.init(sequelize);
Challenge.init(sequelize);
Participant.init(sequelize);
Comment.init(sequelize);
Badge.init(sequelize);
UserBadge.init(sequelize);

User.associate(db);
Routine.associate(db);
RoutineLog.associate(db);
Challenge.associate(db);
Participant.associate(db);
Comment.associate(db);
Badge.associate(db);
UserBadge.associate(db);

module.exports = db;
