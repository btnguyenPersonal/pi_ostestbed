const db = require("..");
const Switch = db.switch;
const utils = require("../config/utils.js");
exports.create = (req, res) => {
  // #swagger.tags = ['switch']
  if (
    !utils.isBodyValid(req, res, {
      switchId: "integer",
      ipAddress: "string",
      username: "string",
      password: "string",
    })
  ) {
    return;
  }
  const switchEntry = {
    switchId: req.body.switchId,
    ipAddress: req.body.ipAddress,
    username: req.body.username,
    password: req.body.password,
  };
  Switch.create(switchEntry)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Switch.",
      });
    });
};

exports.findAll = (req, res) => {
  // #swagger.tags = ['switch']
  Switch.findAll()
    .then((data) => {
      for(var switchIndex in data) {
        theSwitch = data[switchIndex];
        theSwitch.password = "<hidden>"; // Don't send the password lol.
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving switches.",
      });
    });
};

exports.findOne = (req, res) => {
  // #swagger.tags = ['switch']
  const id = req.params.id;
  Switch.findByPk(id)
    .then((data) => {
      if (data) {
        data.password = "<hidden>"; // Don't send the password lol.
        res.send(data);
      } else {
        res.status(500).send({
          message: `Cannot find Switch with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Switch with id=" + id,
      });
    });
};