import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <h1 className="mb-4">Welcome to MediView</h1>
      <button
        onClick={() => navigate("/viewer")}
        className="btn btn-success"
      >
        Open DICOM Viewer
      </button>
    </div>
  );
}

export default Home;
