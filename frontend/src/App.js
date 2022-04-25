import './App.css';
import './TerminalPage.css';
import TerminalPage from './TerminalPage'
import Login from './Login';
import React, { useState } from 'react';
import Dashboard from './dashboards/Dashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import ChangePasswordForm from './ChangePasswordForm';

function App() {
  const [page, setPage] = useState("Login");
  const [computerId, setComputerId] = useState(-1);
  const [userId, setUserId] = useState(-1);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="App">
    {page === "Login" && <Login setPage={setPage} setUserId={setUserId} setIsAdmin={setIsAdmin}/>}
    {page === "Dashboard" && <Dashboard setPage={setPage} setComputerId={setComputerId} userId={userId} isAdmin={isAdmin}/>}
    {page === "AdminDashboard" && <AdminDashboard setPage={setPage} setComputerId={setComputerId} userId={userId} isAdmin={isAdmin}/>}
    {page === "TerminalPage" && <TerminalPage className="TerminalPage" setPage={setPage} computerId={computerId} userId={userId} isAdmin={isAdmin}/>}
    {page === "ChangePasswordForm" && <ChangePasswordForm setPage={setPage} userId={userId} />}
    </div>

  );
}

export default App;
