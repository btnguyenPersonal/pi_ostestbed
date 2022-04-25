const dbConfig = require("./config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  logging: false,
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: 0,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
var db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("./models/user.model.js")(db);
db.eventType = require("./models/eventType.model.js")(db);
db.event = require("./models/event.model.js")(db);
db.password = require("./models/password.model.js")(db);
db.switch = require("./models/switch.model.js")(db);
db.computer = require("./models/computer.model.js")(db);
db.session = require("./models/session.model.js")(db);

module.exports = db;
