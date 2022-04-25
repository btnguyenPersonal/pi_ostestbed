const webSocket = require("ws");
const db = require("..");

const Computer = db.computer;
const Session = db.session;
const Event = db.event;
const User = db.user;

var [computerIdToWebsocketDict] = require("./computerWebsocketServer.js");

const utils = require("../config/utils.js");

const wsServerForQueue = new webSocket.Server({
  port: 9001,
});
//A dictionary mapping wsIds to their associated websocket.
const wsIdToWebsocketDict = {};
//A dictionary mapping userIds to their open websockets list.
const userIdToWsIdListDict = {};
//A dictionary mapping computerIds to it's associated queue of users waiting for it to become available.
var queue = {};
var globalWsId = 1;
initQueue();

async function initQueue() {
  var computers = await Computer.findAll();
  for (var computer of computers) {
    if (!queue[computer.computerId]) {
      queue[computer.computerId] = [];
    }
  }
}

async function informWebsocketOfNewId(ws) {
  await ws.send(
    JSON.stringify({
      messageType: "initialize-websocket",
      wsId: ws.id,
    })
  );
}

wsServerForQueue.on("connection", (ws) => {
  ws.on("message", async (message) => {
    message = JSON.parse(message.toString());
    if (!utils.isMessageValid(message, { messageType: "" })) return;
    if (message.messageType === "websocket-queue-initialization-message") {
      if (!utils.isMessageValid(message, { userId: "" })) return;
      var userId = message.userId;
      var wsId = "ws" + globalWsId++;
      if (wsIdToWebsocketDict[wsId]) return;
      ws.userId = userId;
      ws.id = wsId;
      wsIdToWebsocketDict[wsId] = ws;
      if (userIdToWsIdListDict[userId] == undefined) userIdToWsIdListDict[userId] = [];
      userIdToWsIdListDict[userId].push(wsId);
      await informWebsocketOfNewId(ws);
      await sendQueueDataToWebsocket(ws);
    } else if (message.messageType === "join-queue") {
      if (!utils.isMessageValid(message, { computerId: "" })) return;
      var computerId = message.computerId;
      var userId = ws.userId;
      if (ws.id == undefined) return;
      wsId = ws.id;
      //Add the user to the computer queues they wanted to join.
      await joinQueue(userId, computerId, wsId);
    } else if (message.messageType === "exit-queue") {
      if (!utils.isMessageValid(message, { computerId: "" })) return;
      var computerId = message.computerId;
      var userId = ws.userId;
      if (ws.id == undefined) return;
      //Remove the user from the computer queues they wanted to exit.
      await exitQueue(userId, computerId);
    } else if (message.messageType === "admin-kick-user-off-computer") {
      if (!utils.isMessageValid(message, { adminUserId: "", computerId: "" })) return;
      await handleKickUserOffComputer(message);
    } else if (message.messageType === "admin-join-front-of-queue") {
      if (!utils.isMessageValid(message, { adminUserId: "", computerId: "" })) return;
      await handleJoinFrontOfQueue(message, ws.id);
    } else if (message.messageType === "admin-clear-queue") {
      if (!utils.isMessageValid(message, { adminUserId: "", computerId: "" })) return;
      await handleClearQueue(message);
    } else if (message.messageType === "update-my-queue") {
      await sendQueueDataToWebsocket(ws);
    }
  });

  //This gets called when the user closes out or is granted a computer.
  ws.on("close", async () => {
    var userId = ws.userId;
    if (ws.id == undefined) return;
    await exitQueue(userId, "all");
    userIdToWsIdListDict[userId].splice(userIdToWsIdListDict[userId].indexOf(ws.id), 1);
    delete wsIdToWebsocketDict[ws.id];
  });
});

//Give updated queue data to all users waiting in a queue.
async function updateAllQueueUsers() {
  for (const [wsId] of Object.entries(wsIdToWebsocketDict)) {
    let ws = wsIdToWebsocketDict[wsId];
    await sendQueueDataToWebsocket(ws);
  }
}

async function sendQueueDataToWebsocket(ws) {
  var modQueue = {};
  for (const [computerId] of Object.entries(queue)) {
    modQueue[computerId] = {};
    modQueue[computerId].queue = queue[computerId];
    for (const userId of queue[computerId]) {
      let user = await User.findByPk(userId);
      modQueue[computerId][userId] = { email: user.dataValues.email };
    }
  }
  var computersInUse = {};
  for (const [computerId] of Object.entries(computerIdToWebsocketDict)) {
    let session = await Session.findOne({
      where: {
        computerId: computerId,
        endTime: null,
      },
      order: [["startTime", "DESC"]],
    }).then((session) => {
      return session;
    });
    if (session) {
      let user = await User.findByPk(session.userId);
      computersInUse[computerId] = { session: session, user: user };
    }
  }
  data = {
    messageType: "queue-data",
    queue: modQueue,
    computersInUse: computersInUse,
  };
  await ws.send(JSON.stringify(data));
}

async function exitQueue(userId, computerId) {
  if (userId == undefined) return;
  computersToExit = await getComputersToJoinOrExit(computerId);
  //For each computer in the computers to join, add the user to the respective computer queue.
  for (var computerId of computersToExit) {
    if (queue[computerId] != undefined && queue[computerId].includes(userId)) {
      queue[computerId].splice(queue[computerId].indexOf(userId), 1);
      await createQueueEvent(userId, computerId, utils.EXITED_QUEUE_EVENT_ID);
    }
  }
  //Inform all users the queues have been updated.
  await updateAllQueueUsers();
}

async function joinQueue(userId, computerId, wsId) {
  if (userId == undefined) return;
  let user = await User.findByPk(userId);
  computersToJoin = await getComputersToJoinOrExit(computerId);
  //See if they already have a session.
  let session = await Session.findOne({
    where: {
      userId: userId,
      endTime: null,
    },
    order: [["startTime", "DESC"]],
  }).then((session) => {
    return session;
  });
  //If this user has a session open and they are not an admin, then we cannot let them have this computer.
  if (session && !user.isAdmin) {
    let ws = wsIdToWebsocketDict[wsId];
    await ws.send(
      JSON.stringify({
        messageType: "message-to-display",
        body: "You cannot join a queue when you already have a computer. You currently already have computerId=" + session.computerId,
      })
    );
    return;
  }
  //For each computer in the computers to join, add the user to the respective computer queue.
  for (var computerId of computersToJoin) {
    //If we don't have a queue for the specific computerId, create an empty one.
    if (!queue[computerId]) {
      queue[computerId] = [];
    }
    if (!queue[computerId].includes(userId)) {
      queue[computerId].push(userId);
      await prioritizeWebsocket(userId, wsId);
      await createQueueEvent(userId, computerId, utils.JOINED_QUEUE_EVENT_ID);
    }
  }
  //Inform all users the queues have been updated.
  await updateAllQueueUsers();
}

//Looks through the computers table and if one is available, it grants access to the first user in the queue.
async function checkForOpenComputers() {
  computers = await Computer.findAll();
  for (var computer of computers) {
    computerId = computer.computerId;
    if (!computer.inUse) {
      //If there is a queue and it has users in it, then give the computer to the first user.
      if (queue[computerId] && queue[computerId].length > 0) {
        userId = queue[computerId][0];
        //If this user has a list of open queue websockets (should always if we get this far), then give the computer to the first websocket.
        if (userIdToWsIdListDict[userId] && userIdToWsIdListDict[userId].length > 0) {
          wsId = userIdToWsIdListDict[userId][0];
          await giveComputerToWebsocket(computerId, wsId);
          await exitQueue(userId, "all");
        }
      }
    }
  }
}

//Grant a user a computer they were waiting for. We do this by sending them a message which instructs the frontend to move to the TerminalPage.
async function giveComputerToWebsocket(computerId, wsId) {
  let ws = wsIdToWebsocketDict[wsId];
  await ws.send(
    JSON.stringify({
      messageType: "granted-computer",
      computerId: computerId,
    })
  );
}

async function getComputersToJoinOrExit(computerId) {
  var computersToJoinOrExit = [];
  if (computerId === "all") {
    var computers = await Computer.findAll();
    for (var computer of computers) {
      computersToJoinOrExit.push(computer.computerId);
    }
  } else {
    computersToJoinOrExit.push(computerId);
  }
  return computersToJoinOrExit;
}

//This function makes a specific websocket first in priority in the user's list of websockets.
//This is needed because occasionally a user may have multiple dashboards open, and we want to make sure
//The last page they joined a queue with will be the one who receives the computer.
async function prioritizeWebsocket(userId, wsId) {
  if (!userIdToWsIdListDict[userId]) return;
  userIdToWsIdListDict[userId].splice(userIdToWsIdListDict[userId].indexOf(wsId), 1);
  userIdToWsIdListDict[userId].unshift(wsId);
}

async function createQueueEvent(userId, computerId, eventTypeId) {
  data = {
    queueComputerId: computerId,
    numUsersWaiting: queue[computerId].length,
  };
  await utils.createEvent(eventTypeId, userId, data);
}

async function logStateOfQueue() {
  await Event.create({
    eventTypeId: utils.STATE_OF_QUEUE_LOGGING_EVENT_ID,
    userId: -1,
    data: JSON.stringify({
      queue,
    }),
  });
}

//Check for open computers every half second.
setInterval(() => {
  checkForOpenComputers();
}, 500);

//Log state of computers queue every minute.
setInterval(() => {
  logStateOfQueue();
}, 60000);

// Start of admin specific things: --------------------------------------------------------------------------------

async function handleKickUserOffComputer(message) {
  var adminUserId = message.adminUserId;
  var computerId = message.computerId;
  if (!(await isUserAdmin(adminUserId))) return;
  var wsToKick = computerIdToWebsocketDict[computerId];
  if (!wsToKick) return;
  await wsToKick.send(
    JSON.stringify({
      messageType: "admin-kicked-user",
    })
  );
  await updateAllQueueUsers();
  await utils.createEvent(utils.ADMIN_KICKED_USER_OFF_COMP_EVENT_ID, adminUserId, { userKickedOff: wsToKick.userId });
}

async function handleJoinFrontOfQueue(message, wsId) {
  var adminUserId = message.adminUserId;
  var computerId = message.computerId;
  if (!(await isUserAdmin(adminUserId))) return;
  await joinFrontOfQueue(adminUserId, computerId, wsId);
  await utils.createEvent(utils.ADMIN_JOINED_FRONT_OF_QUEUE_EVENT_ID, adminUserId, { numUsersSkipped: queue[computerId].length - 1 });
}

async function handleClearQueue(message) {
  var adminUserId = message.adminUserId;
  var computerId = message.computerId;
  if (!(await isUserAdmin(adminUserId))) return;
  var numUsersCleared = queue[computerId].length;
  await clearQueue(computerId);
  await utils.createEvent(utils.ADMIN_CLEARED_QUEUE_EVENT_ID, adminUserId, { numUsersCleared: numUsersCleared });
}

async function clearQueue(computerId) {
  specificQueue = queue[computerId].map((x) => x);
  for (var userId of specificQueue) {
    await exitQueue(userId, computerId);
  }
}

async function isUserAdmin(userId) {
  sqlUser = await User.findByPk(userId);
  if (!sqlUser) return false;
  return sqlUser.isAdmin;
}

async function joinFrontOfQueue(userId, computerId, wsId) {
  if (!queue[computerId]) {
    queue[computerId] = [];
  }
  if (!queue[computerId].includes(userId)) {
    queue[computerId].unshift(userId);
    await prioritizeWebsocket(wsId);
    await createQueueEvent(userId, computerId, utils.JOINED_QUEUE_EVENT_ID);
  }
  await updateAllQueueUsers();
}
