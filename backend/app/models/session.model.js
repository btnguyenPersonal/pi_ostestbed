module.exports = (db) => {
  var sequelize = db.sequelize;
  var Sequelize = db.Sequelize;
  const Computer = db.computer;
  const User = db.user;
  const Session = sequelize.define(
    "sessions",
    {
      sessionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      computerId: {
        type: Sequelize.INTEGER,
      },
      startTime: {
        type: Sequelize.DATE,
      },
      endTime: {
        type: Sequelize.DATE,
      },
    },
    {
      createdAt: false,
      updatedAt: false,
    }
  );
  Session.belongsTo(Computer, {foreignKey: "computerId"})
  Session.belongsTo(User, {foreignKey: "userId"})
  return Session;
};
