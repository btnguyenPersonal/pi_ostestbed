const db = require("../");
const Event = db.event;

module.exports = {
  LOGIN_EVENT_ID: 1,
  ADMIN_LOGIN_EVENT_ID: 2,
  CHANGED_PASSWORD_EVENT_ID: 3,
  CHANGED_ADMIN_PASSWORD_EVENT_ID: 4,
  SESSION_START_EVENT_ID: 5,
  SESSION_END_EVENT_ID: 6,
  JOINED_QUEUE_EVENT_ID: 7,
  EXITED_QUEUE_EVENT_ID: 8,
  STATE_OF_QUEUE_LOGGING_EVENT_ID: 9,
  ADMIN_KICKED_USER_OFF_COMP_EVENT_ID: 10,
  ADMIN_JOINED_FRONT_OF_QUEUE_EVENT_ID: 11,
  ADMIN_CLEARED_QUEUE_EVENT_ID: 12,
  isBodyValid(req, res, requirements) {
    for (const [key, value] of Object.entries(requirements)) {
      if (req.body[key] == undefined) {
        if (res) {
          res.status(412).send({
            message: `Missing attribute: "${key}": <${value}>`,
          });
        } else {
          console.log(`Missing attribute: "${key}": <${value}>`);
        }
        return false;
      }
    }
    return true;
  },
  isMessageValid(data, requirements) {
    for (const [key] of Object.entries(requirements)) {
      if (data[key] == undefined) {
        return false;
      }
    }
    return true;
  },
  async createEvent(eventTypeId, userId, data) {
    await Event.create({
      eventTypeId: eventTypeId,
      userId: userId,
      data: JSON.stringify(data),
    });
  },
};
