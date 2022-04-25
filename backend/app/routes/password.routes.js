module.exports = (app) => {
  const password = require("../controllers/password.controller.js");
  var router = require("express").Router();
  router.post("/api/password/", password.create);
  router.get("/api/password/:id", password.findOne);
  router.get("/api/password/", password.findAll);
  app.use("", router);
};