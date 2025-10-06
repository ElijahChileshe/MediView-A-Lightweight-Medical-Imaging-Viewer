import React, { useEffect, useRef, useState } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import MetadataPanel from "../components/MetadataPanel";
import { extractDicomMetadata } from "../components/extractDicomMetadata";

function Viewer() {
  // Reference to the viewer div (where the image is rendered)
  const elementRef = useRef(null);

  // State to hold uploaded file and extracted metadata
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    if (!file) return; // Exit early if no file selected

    const element = elementRef.current;
    cornerstone.enable(element); // Enable Cornerstone on the div

    // Link cornerstone and dicomParser to cornerstoneWADOImageLoader
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

    // Register the WADO image loader
    cornerstone.registerImageLoader(
      "wadouri",
      cornerstoneWADOImageLoader.wadouri.loadImage
    );

    // Initialize web workers for decoding DICOM files
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      webWorkerPath:
        "https://unpkg.com/cornerstone-wado-image-loader@latest/dist/cornerstoneWADOImageLoaderWebWorker.js",
      taskConfiguration: {
        decodeTask: {
          codecsPath:
            "https://unpkg.com/cornerstone-wado-image-loader@latest/dist/cornerstoneWADOImageLoaderCodecs.js",
        },
      },
    });

    // Read the uploaded file and extract metadata
    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target.result;
      const byteArray = new Uint8Array(arrayBuffer);

      // Parse the DICOM dataset
      const dataSet = dicomParser.parseDicom(byteArray);

      // Extract key metadata fields
      setMetadata(extractDicomMetadata(dataSet));

      

      // Load and display the DICOM image
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      cornerstone
        .loadImage(imageId)
        .then((image) => cornerstone.displayImage(element, image))
        .catch((err) => console.error("Failed to load image:", err));
    };

    reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer

    // Cleanup on component unmount
    return () => cornerstone.disable(element);
  }, [file]);

  return (
    <div
      className="container mt-5"
      style={{
        maxWidth: "1100px",
        background: "#f8f9fa",
        padding: "20px",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <h2 className="text-center mb-4" style={{ fontWeight: 600 }}>
        🩻 Mini DICOM Viewer
      </h2>

      {/* File Upload Input */}
      <div className="text-center mb-4">
        <input
          type="file"
          accept=".dcm"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setMetadata({});
          }}
          className="form-control"
          style={{
            width: "300px",
            margin: "0 auto",
            borderRadius: "8px",
          }}
        />
      </div>

      {/* Layout Grid: Viewer (Left) + Metadata Panel (Right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60% 38%",
          gap: "2%",
          alignItems: "flex-start",
        }}
      >
        {/* 🖼️ DICOM Image Viewer */}
        <div
          ref={elementRef}
          style={{
            width: "100%",
            height: "512px",
            backgroundColor: "black",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        ></div>

        {/* 📋 Metadata Panel */}
        {Object.keys(metadata).length > 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              height: "512px",
              overflowY: "auto", // ✅ Enables scrolling for long metadata
            }}
          >
            <h5
              style={{
                fontWeight: 600,
                marginBottom: "12px",
                textAlign: "center",
                color: "#333",
              }}
            >
              DICOM Metadata
            </h5>
            <MetadataPanel metadata={metadata} />
          </div>
        ) : (
          // Placeholder when no file is uploaded
          <div
            style={{
              textAlign: "center",
              color: "#777",
              fontStyle: "italic",
              paddingTop: "200px",
            }}
          >
            Upload a DICOM file to view details
          </div>
        )}
      </div>
    </div>
  );
}

export default Viewer;
