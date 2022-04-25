import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./ChangePasswordForm.css";

function ChangePasswordForm({ userId }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConf, setNewPasswordConf] = useState("");
  const [passwordToChange, setPasswordToChange] = useState("");
  
  const studentPasswordText = "Student Password";
  const adminPasswordText = "Admin Password";

  function validateForm() {
    return oldPassword.length > 0 && newPassword.length > 0 && newPasswordConf === newPassword && passwordToChange !== "";
  }

  function handleSubmit(event) {
    sendPasswords(oldPassword, newPassword);
    event.preventDefault();
  }

  function sendPasswords(oldPassword, newPassword) {
    const data = { 
        oldPassword: oldPassword,
        newPassword: newPassword,
        userId: userId,
        changeAdminPassword: (passwordToChange === studentPasswordText ? false : true)
    };
    fetch(`http://${process.env.REACT_APP_IP}:8080/api/password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(async (response) => {
        let json = await response.json();
        document.getElementById("message_").innerHTML = "<p><small>" + json.message + "</small>";
    });
  }

  let content = (
    <div className="ChangePassword">
      <h1>Change Password</h1>
      <Form onSubmit={handleSubmit}>

        <Form.Label className="input_field_label">Which password would you like to change? </Form.Label>
        <Form.Group size="lg">
        <Form.Label className="input_field_label">Student Password</Form.Label>
        <Form.Control
            type="radio"
            value={studentPasswordText}
            checked = {passwordToChange === studentPasswordText}
            onChange={(e) => setPasswordToChange(e.target.value)}
        />
        <br/>
        <Form.Label className="input_field_label">Admin Password</Form.Label>
        <Form.Control
            type="radio"
            value={adminPasswordText}
            checked = {passwordToChange === adminPasswordText}
            onChange={(e) => setPasswordToChange(e.target.value)}
        />
        </Form.Group>
        <br/>
        <Form.Label className="input_field_label">Old Password: </Form.Label>
        <Form.Group size="lg" controlId="oldPassword">
          <Form.Control
            className="input_field1"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Label className="input_field_label">New Password: </Form.Label>
        <Form.Group size="lg" controlId="newPassword">
          <Form.Control
            className="input_field2"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Label className="input_field_label">Confirm New Password: </Form.Label>
        <Form.Group size="lg" controlId="newPasswordConf">
          <Form.Control
            className="input_field3"
            type="password"
            value={newPasswordConf}
            onChange={(e) => setNewPasswordConf(e.target.value)}
          />
        </Form.Group>
        <Button size="lg" type="submit" disabled={!validateForm()}>
          Change Password
        </Button>
      </Form>
      <div id="message_"></div>
    </div>
  );

  return content;
}

export default ChangePasswordForm;
