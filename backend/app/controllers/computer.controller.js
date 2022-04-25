const db = require("..");
const Computer = db.computer;
const utils = require("../config/utils.js");
exports.create = (req, res) => {
  // #swagger.tags = ['computer']
  if (
    !utils.isBodyValid(req, res, {
      portId: "integer",
      model: "string",
    })
  ) {
    return;
  }
  const computer = {
    portId: req.body.portId,
    model: req.body.model,
  };
  Computer.create(computer)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Computer.",
      });
    });
};

exports.findAll = (req, res) => {
  // #swagger.tags = ['computer']
  Computer.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving computers.",
      });
    });
};

exports.findOne = (req, res) => {
  // #swagger.tags = ['computer']
  const id = req.params.id;
  Computer.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(500).send({
          message: `Cannot find Computer with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Computer with id=" + id,
      });
    });
};
