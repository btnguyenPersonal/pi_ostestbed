const db = require("..");
const Session = db.session;
const utils = require("../config/utils.js");
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  // #swagger.tags = ['session']

  /*
    #swagger.description = 'Not used in prod. Just for testing.'
  
    #swagger.parameters['body'] = { 
      in: 'body',
      schema: {
        userId: 1,
        computerId: 2
      },
      description: 'A json object containing the user getting the computer and the computer id of the new session.'
    }

  */
  if (
    !utils.isBodyValid(req, res, {
      userId: "integer",
      computerId: "integer",
    })
  ) {
    return;
  }
  const session = {
    userId: req.body.event_type,
    computerId: req.body.event_type,
    startTime: Date.now(),
  };
  Session.create(session)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Session.",
      });
    });
};

exports.findAll = (req, res) => {
  // #swagger.tags = ['session']
  Session.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving sessions.",
      });
    });
};

exports.findOne = (req, res) => {
  // #swagger.tags = ['session']
  const id = req.params.id;
  Session.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(500).send({
          message: `Cannot find Session with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Session with id=" + id,
      });
    });
};
