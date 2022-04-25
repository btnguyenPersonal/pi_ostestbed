module.exports = (app) => {
  const session = require("../controllers/session.controller.js");
  var router = require("express").Router();
  router.post("/api/session/", session.create);
  router.get("/api/session/:id", session.findOne);
  router.get("/api/session/", session.findAll);
  app.use("", router);
};
