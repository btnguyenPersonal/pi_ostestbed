module.exports = (db) => {
  var sequelize = db.sequelize;
  var Sequelize = db.Sequelize;
  const Password = sequelize.define("passwords", {
    passwordId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    password: {
      type: Sequelize.STRING,
    },
    isAdminPassword: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  });
  return Password;
};
