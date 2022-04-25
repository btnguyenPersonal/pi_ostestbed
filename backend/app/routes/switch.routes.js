module.exports = (app) => {
    const switchEntry = require("../controllers/switch.controller.js");
    var router = require("express").Router();
    router.post("/api/switch/", switchEntry.create);
    router.get("/api/switch/:id", switchEntry.findOne);
    router.get("/api/switch/", switchEntry.findAll);
    app.use("", router);
  };
  