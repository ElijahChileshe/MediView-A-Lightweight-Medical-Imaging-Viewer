import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // We'll create a separate CSS file for styling

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Background animated circles */}
      <div className="background-circles">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div className="circle circle3"></div>
        <div className="circle circle4"></div>
        <div className="circle circle5"></div>
      </div>

      {/* Main content */}
      <div className="home-content">
        <h1 className="home-title">Welcome to MedInsight</h1>
        <p className="home-subtitle">Your Mini DICOM Viewer</p>
        <button
          onClick={() => navigate("/viewer")}
          className="home-button"
        >
          Open Viewer
        </button>
      </div>
    </div>
  );
}

export default Home;
