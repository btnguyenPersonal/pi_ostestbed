module.exports = (db) => {
  var sequelize = db.sequelize;
  var Sequelize = db.Sequelize;
  const Event = sequelize.define(
    "events", {
      eventId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      eventTypeId: {
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      data: {
        type: Sequelize.STRING
      }
    }, {
      updatedAt: false,
    }
  );
  Event.belongsTo(db.eventType, {
    foreignKey: "eventTypeId"
  });
  return Event;
};