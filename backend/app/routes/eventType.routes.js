module.exports = (app) => {
  const event_types = require("../controllers/eventType.controller.js");
  var router = require("express").Router();
  router.post("/api/eventTypes/", event_types.create);
  router.get("/api/eventTypes/", event_types.findAll);
  router.get("/api/eventTypes/:id", event_types.findOne);
  app.use("", router);
};
