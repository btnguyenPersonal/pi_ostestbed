module.exports = (app) => {
  const event = require("../controllers/event.controller.js");
  var router = require("express").Router();
  router.post("/api/event/", event.create);
  router.get("/api/event/", event.findAll);
  app.use("", router);
};