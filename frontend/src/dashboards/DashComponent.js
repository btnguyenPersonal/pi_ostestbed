import React, {  useState, useEffect } from "react";

var qws;
var wsIdDebug = "empty";

function DashComponent({ setPage, setComputerId, userId, isAdmin }) {
  const [list, setList] = useState(null);
  const [loaded, setLoaded] = useState(false);

  var [queue, setQueue] = useState(null);
  var [computersInUse, setComputersInUse] = useState(null);

  React.useEffect(() => {
    initWebSocket();
    window.onbeforeunload = () => qws.close();
    return () => {
      window.removeEventListener("beforeunload", () => {});
    };
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (list != null) setLoaded(true);
  }, [list]);

  async function loadData() {
    setLoaded(false);
    const res = await fetch(
      `http://${process.env.REACT_APP_IP}:8080/api/computer`
    );
    setList(await res.json());
    qws.send(
      JSON.stringify({
        messageType: "update-my-queue"
      })
    );
  };

  async function initWebSocket() {
    qws = new WebSocket(`ws://${process.env.REACT_APP_IP}:9001`);

    qws.onopen = async () => {
      qws.send(
        JSON.stringify({
          messageType: "websocket-queue-initialization-message",
          userId: userId,
        })
      );
    }

    qws.onmessage = async (messageFromBackend) => {
      //Convert the message to an object we can easily work with.
      var message = JSON.parse(messageFromBackend.data.toString());
      if (message.messageType === "initialize-websocket") {
        qws.id = message.wsId;
        wsIdDebug = message.wsId;       
        loadData(); //Refresh the page, why not.
      } else if (message.messageType === "granted-computer") {
        obtainComputer(message.computerId);
        loadData(); //Refresh the page, why not.
      } else if (message.messageType === "message-to-display") {
        document.getElementById("message_box").innerHTML =
          "<p><small>" + message.body + "</small></p>";
        loadData(); //Refresh the page, why not.
      } else if (message.messageType === "queue-data") {
        setQueue(message.queue);
        setComputersInUse(message.computersInUse);
      }
    };

    qws.onclose = () => {
      console.log("Queue websocket closed.");
    };
  }

  async function joinQueue(computerId) {
    qws.send(
      JSON.stringify({ messageType: "join-queue", computerId: computerId })
    );
  }

  async function exitQueue(computerId) {
    qws.send(
      JSON.stringify({ messageType: "exit-queue", computerId: computerId })
    );
  }

  function isInQueue(computerId) {
    return queue[computerId].queue.includes(userId);
  }

  function getPositionStr(computerId) {
    if (isInQueue(computerId)) {
      var thePosition = queue[computerId].queue.indexOf(userId);
      return (
        " | Position in queue: " +
        thePosition +
        " " +
        (thePosition === 0 ? "(You are next!)" : "")
      );
    } else {
      return "Not in queue for computerId=" + computerId;
    }
  }

  function kickUserOffComputer(computerId) {
    qws.send(JSON.stringify({
      messageType: "admin-kick-user-off-computer",
      adminUserId: userId,
      computerId: computerId
    }));
    setTimeout(function () {
      loadData();
    }, 300);
  }

  function joinFrontOfQueue(computerId) {
    qws.send(JSON.stringify({
      messageType: "admin-join-front-of-queue",
      adminUserId: userId,
      computerId: computerId
    }));
  }

  function clearQueue(computerId) {
    qws.send(JSON.stringify({
      messageType: "admin-clear-queue",
      adminUserId: userId,
      computerId: computerId
    }));
  }

  function obtainComputer(computerId) {
    let requestBody = { userId: userId, computerId: computerId };
    fetch(`http://${process.env.REACT_APP_IP}:8080/api/useComputer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }).then(async (response) => {
      let json = await response.json();
      if (response.status === 200) {
        setComputerId(computerId);
        await qws.close();
        setPage("TerminalPage");
      } else {
        document.getElementById("message_box").innerHTML =
          "<p><small>" + json.message + "</small></p>";
      }
    });
  }

  function getSessionInfo(computerId) {
    if(!computersInUse) return "";
    if(!computersInUse[computerId]) return "";
    return "Session Duration: " + getSessionDuration(computerId) + " | Active User: " + computersInUse[computerId].user.email
  }

  function getSessionDuration(computerId) {
    var now = new Date();
    var sessionStart = new Date(computersInUse[computerId].session.startTime);
    var durationMs = now - sessionStart;
    var hours = Math.floor(durationMs/(1000*60*60));
    var minutes = (durationMs/(1000*60)).toFixed(0);
    //actually needs to not use !=
    return (hours != 0 ? hours + "h " : "") +
      (minutes != 0 ? minutes + "m " : "<1m")
  }

  let content = (
    <nav>
      <div
        className="Header"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <button
          onClick={() => {
            loadData();
            document.getElementById("message_box").innerHTML = "";
          }}
        >
          Refresh Page
        </button>
        {isAdmin ? <div>Welcome admin</div> : <div>Welcome</div>}
        <div>OS Pi Testbed</div>
      </div>
      <div id="message_box"></div>
      {loaded ? (
        <ul>
          {list.map((item) => (
            <li key={item.computerId}>
              Computer ID: {item.computerId} | Computer Type: {item.model}
              {queue
                ? ` | Users in Queue: ${JSON.stringify(
                    queue[item.computerId].queue.length
                  )}`
                : ""}
              {queue && isInQueue(item.computerId)
                ? getPositionStr(item.computerId)
                : ""}
              {!item.inUse ? (
                <div style={{ color: `#33CC33` }}>
                  <b>AVAILABLE</b>
                </div>
              ) : (
                <div style={{ color: `#FF0000` }}>
                  <b>IN USE</b>
                </div>
              )}
              {isAdmin ? (
                <div>
                  {getSessionInfo(item.computerId)}
                </div>
              ) : ""}
              <br/>
              {queue ? (
                !isInQueue(item.computerId) ? (
                  <button
                    style={{ backgroundColor: `#8EE690` }}
                    onClick={() => joinQueue(item.computerId)}
                  >
                    JOIN QUEUE
                  </button>
                ) : (
                  <button
                    style={{ backgroundColor: `#E68E8E` }}
                    onClick={() => exitQueue(item.computerId)}
                  >
                    EXIT QUEUE
                  </button>
                )
              ) : (
                ""
              )}
              {isAdmin ? (
                <div>
                  <br/>
                <button
                  style={{ backgroundColor: `#7EC8E3` }}
                  onClick={() => kickUserOffComputer(item.computerId)}>
                  KICK USER OFF COMPUTER
                </button> <div></div>
                <button
                  style={{ backgroundColor: `#7EC8E3` }}
                  onClick={() => joinFrontOfQueue(item.computerId)}>
                  JOIN FRONT OF QUEUE
                </button>
                <button
                  style={{ backgroundColor: `#7EC8E3` }}
                  onClick={() => clearQueue(item.computerId)}>
                  CLEAR QUEUE
                </button>
              </div>
                ) : ""
              } 
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
      <button onClick={() => joinQueue("all")}>JOIN ALL QUEUES </button>
      <button onClick={() => exitQueue("all")}>EXIT ALL QUEUES </button>
      {isAdmin ? (
        <div>       
          <div>
          </div>
          <button onClick={() => setPage("ChangePasswordForm")}>
            Go to Change Password
          </button>
        </div>

      ) : ""}
      <br/>
      <div id="debugthing"> <b>STUFF FOR DEBUGGING:</b></div>
      <div id="queue-state"> QUEUE STATE: {JSON.stringify(queue)}</div>
      <div id="user"> USER ID: {userId}</div>
      <div id="wsId"> WS ID: {wsIdDebug}</div>
    </nav>
  );

  return content;
}

export default DashComponent;
