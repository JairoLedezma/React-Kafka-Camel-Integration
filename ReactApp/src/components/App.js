import React, { useEffect } from 'react'
import { useState } from "react";

import './App.css';

function App(){

  async function connect() {
    setStatus("Connecting...");
    setStatusColor("#ffc107");
  
    const reponse = await fetch("http://localhost:8088/connect");
    if(reponse.ok){
      setStatus("Connected");
      setStatusColor("#01ce21");
    }
    else{
      setStatus("Disconnected");
      setStatusColor("#dc3545");
    }
  }

  async function disconnect() {
    setStatus("Disconnecting...");
    setStatusColor("#ffc107");
  
    const reponse = await fetch("http://localhost:8088/disconnect");
    if(reponse.ok){
      setStatus("Disconnected");
      setStatusColor("#dc3545");
    }
    else{
      setStatus("Connected");
      setStatusColor("#01ce21");
    }
  }

  async function sendData() {
    try{
      JSON.parse(sendBody)
    } catch(e){
      setInfo("Invalid JSON");
      return false;
    }

    setInfo("");
    const response = await fetch("http://localhost:8088/send", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: sendBody
    })

    var value = await response.text();
    setReceiveBody(value);
  }

  const [status, setStatus] = useState("Connecting...");
  const [statusColor, setStatusColor] = useState("#ffc107");

  const [sendBody, setSendBody] = useState(`[
    {
      "DOB": "01/01/1970",
      "hasLicense": true,
      "isLicenseValid": true
    },
    {
      "DOB": "01/01/1970",
      "hasLicense": true,
      "isLicenseValid": false
    }
]`);
  const handleSetSendBody = (e) => {
    setSendBody(e.target.value);
  }

  const [receiveBody, setReceiveBody] = useState(``);
  const [info, setInfo] = useState(``);

  useEffect(() => {
    async function onInit() {
      const reponse = await fetch("http://localhost:8088/disconnect");
      if(reponse.ok){
        setStatus("Disconnected");
        setStatusColor("#dc3545");
      }
      else{
        setStatus("Connected");
        setStatusColor("#01ce21");
      }
    }
    onInit();
  }, []);
  
  return(
    <div>
      <div className="container mt-4">
        <div className="display-6 mb-4">React Kafka <span className="h2 ms-4 text-white-50" style={{ "paddingLeft": "5px" }}>Dashboard</span></div>
        <div className="d-flex row-cols-auto mt-4 align-items-center border-top border-bottom border-warning">
            <button className="btn btn-outline-light col me-2" onClick={ connect }>Connect</button>
            <button className="btn btn-outline-light col me-2" onClick={ disconnect }>Disconnect</button>
            <div className="h5 m-0 ms-4" style={{ "fontSize": "1.4rem" }}>Status<span className="ms-2" style={{ "color": statusColor, "fontWeight": "300" }}>{ status }</span></div>
            <div className="h5 text-warning ms-4 my-3 py-1 px-2"><i className="bi bi-exclamation-triangle-fill me-2"></i>For Debugging</div>
        </div>
      </div>
      <div className="container mt-5">
        <div className="row">
            <div className="col me-4 p-4">Enter JSON Payload</div>
            <div className="col ms-4 p-4">Response Received:</div>
        </div>
        <div className="row">
            <textarea className="col me-4 p-4 bg-dark text-light" style={{ "overflowY": "scroll", "overflowX": "hidden", "height": "500px", "border": "1px solid #909090", "borderRadius": "4px" }} value={ sendBody } onChange={ handleSetSendBody }/>
            <textarea className="col ms-4 p-4 bg-dark text-light" style={{ "overflowY": "scroll", "overflowX": "hidden", "height": "500px", "border": "1px solid #909090", "borderRadius": "4px" }} value={ receiveBody } readOnly/>
        </div>
        <div className="row mt-4">
            <div className="col me-4 p-0 text-align-end">
              <button className="btn btn-outline-light col me-2 w-100" style={{ "padding": "14px 0px" }} onClick={ sendData } >Send</button>
            </div>
            <div className="col ms-4 p-0">
              
            </div>
        </div>
        <div className="row border border-warning rounded py-3 px-4 mt-4" style={{ display: info?"flex":"none" }}>
          <span>{ info }</span>
        </div>
      </div>
    </div>
  );
}

export default App;
