const db = require("..");
const bcrypt = require("bcrypt");
const Password = db.password;
const User = db.user;
const Event = db.event;
const utils = require("../config/utils.js");

exports.create = async (req, res) => {
  // #swagger.tags = ['password']
  if (
    !utils.isBodyValid(req, res, {
      oldPassword: "string",
      newPassword: "string",
      userId: "integer",
      changeAdminPassword: "boolean",
    })
  ) {
    return;
  }
  User.findByPk(req.body.userId).then(async (user) => {
    if (user) {
      if (user.dataValues.isAdmin) {
        //Get current normal or admin password.
        let sqlPassword = await Password.findOne({
          where: {
            isAdminPassword: req.body.changeAdminPassword,
          },
          order: [["createdAt", "DESC"]],
        });
        doOldPasswordsMatch = await bcrypt.compare(req.body.oldPassword, sqlPassword.password);
        if(doOldPasswordsMatch) {
          hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
          sqlPassword.password = hashedNewPassword;
          await sqlPassword.save();
          await Event.create({
            eventTypeId: req.body.changeAdminPassword ? utils.CHANGED_ADMIN_PASSWORD_EVENT_ID : utils.CHANGED_PASSWORD_EVENT_ID,
            userId: user.dataValues.userId,
          });
          res.status(200).send({
            message: (req.body.changeAdminPassword ? "Admin password" : "Password") + " changed successfully.",
            password: sqlPassword,
          });
        } else {
          res.status(403).send({
            message: "Old password does not match the " + (req.body.changeAdminPassword ? "admin password" : "password") + ".",
          });
        }
      } else {
        res.status(403).send({
          message: "Not an admin. Don't even try...",
        });
      }
    } else {
      res.status(401).send({
        message: "Could not find a user with userId: " + req.body.userId,
      });
    }
  });
};

exports.findAll = (req, res) => {
  // #swagger.tags = ['password']
  Password.findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving passwords.",
      });
    });
};

exports.findOne = (req, res) => {
  // #swagger.tags = ['password']
  const id = req.params.id;
  Password.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(500).send({
          message: `Cannot find Password with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error retrieving Password with id=" + id,
      });
    });
};
