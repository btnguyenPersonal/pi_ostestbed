module.exports = (db) => {
  var sequelize = db.sequelize;
  var Sequelize = db.Sequelize;
  const User = sequelize.define("users", {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
    },
  });
  return User;
};
