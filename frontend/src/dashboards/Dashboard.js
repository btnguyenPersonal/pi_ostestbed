import React from "react";
import "./Dashboard.css";
import DashComponent from "./DashComponent";

function Dashboard({ setPage, setComputerId, userId, isAdmin }) {
  let content = (
    <DashComponent setPage={setPage} setComputerId={setComputerId} userId={userId} isAdmin={isAdmin}/>
  );

  return content;
}

export default Dashboard;
