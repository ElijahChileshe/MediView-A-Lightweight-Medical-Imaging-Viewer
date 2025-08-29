import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleViewDicom = () => {
    navigate("/viewer");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Welcome to MediView</h1>
      <button
        onClick={handleViewDicom}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Open DICOM Viewer
      </button>
    </div>
  );
}

export default Home;
