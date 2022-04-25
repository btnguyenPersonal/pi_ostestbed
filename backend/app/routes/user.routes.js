module.exports = (app) => {
  const user = require("../controllers/user.controller.js");
  var router = require("express").Router();
  router.post("/api/user/", user.create);
  router.get("/api/user/", user.findAll);
  router.get("/api/user/:id", user.findOne);
  app.use("", router);
};