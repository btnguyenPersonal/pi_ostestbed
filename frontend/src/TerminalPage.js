import Terminal from "./terminalComponents/Terminal";
import React, { useState } from "react";

function TerminalPage({ setPage, computerId, userId, isAdmin }) {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = () => {
    const formData = new FormData();

    formData.append("imgFile", selectedFile);

    fetch(`http://${process.env.REACT_APP_IP}:8080/api/upload/${computerId}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.message !== "Successful file upload") {
          document.getElementById("errorStatus").innerHTML = "<p>" + result.message + "</p>";
        } else {
          setFileUploaded(true);
          document.getElementById("fileStatus").innerHTML = "<p>" + result.message + "</p>";
        }
      })
      .catch((error) => {
        setFileUploaded(true);
        document.getElementById("fileStatus").innerHTML = "<p>" + error + "</p>";
      });
  };

  const Upload = () => {
    return (
      <div>
        <input type="file" name="file" onChange={changeHandler} />
        {isFilePicked ? (
          <div>
            <p>Filename: {selectedFile.name}</p>
            <p>Size in bytes: {(selectedFile.size / Math.pow(1000, 2)).toFixed(2)} mb</p>
            <p>lastModifiedDate: {selectedFile.lastModifiedDate.toLocaleDateString()}</p>
          </div>
        ) : (
          <p>Select a file to show details</p>
        )}
        <div>
          <button onClick={handleSubmission}>Submit</button>
        </div>
        <div id="errorStatus"></div>
      </div>
    );
  };

  let content = (
    <div>
      {fileUploaded ? (
        <div>
          <div id="fileStatus"></div> <br /> <button onClick={() => setFileUploaded(false)}>Submit new File</button>{" "}
          <button
            onClick={() =>
              fetch(`http://${process.env.REACT_APP_IP}:8080/api/reboot/${computerId}`, {
                method: "POST",
              })
            }
          >
            Reset Pi
          </button>
          <div id="fail_message"></div>
        </div>
      ) : (
        <Upload />
      )}

      <Terminal setPage={setPage} computerId={computerId} userId={userId} isAdmin={isAdmin}/>
    </div>
  );
  return content;
}

export default TerminalPage;
