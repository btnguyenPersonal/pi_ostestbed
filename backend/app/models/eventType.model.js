module.exports = (db) => {
  var sequelize = db.sequelize;
  var Sequelize = db.Sequelize;
  const EventType = sequelize.define(
    "event_types",
    {
      eventTypeId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      eventType: {
        type: Sequelize.STRING,
      },
    },
    {
      updatedAt: false,
    }
  );
  return EventType;
};
