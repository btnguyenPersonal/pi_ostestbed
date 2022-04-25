const db = require("..");
const User = db.user;
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  // #swagger.tags = ['user']
  if (!req.body.email) {
    res.status(412).send({
      message: 'Requires an email: "email": <string>',
    });
    return;
  }
  const user = {
    email: req.body.email,
  };
  if (req.body.isAdmin) {
    user.isAdmin = req.body.isAdmin;
  }
  User.create(user)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      });
    });
};

exports.findAll = (req, res) => {
  // #swagger.tags = ['user']
  User.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users.",
      });
    });
};

exports.findOne = (req, res) => {
  // #swagger.tags = ['user']
  const id = req.params.id;
  User.findByPk()
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(500).send({
          message: `Cannot find User with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving User with id=" + id,
      });
    });
};
