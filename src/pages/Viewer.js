import React, { useEffect, useRef, useState } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import MetadataPanel from "../components/MetadataPanel";
import { extractDicomMetadata } from "../components/extractDicomMetadata";
import { anonymizeMetadata } from "../components/anonymize";

const Viewer = () => {
  const elementRef = useRef(null);
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [isAnonymized, setIsAnonymized] = useState(false);

  useEffect(() => {
    if (!file) return;
    const element = elementRef.current;
    cornerstone.enable(element);

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstone.registerImageLoader("wadouri", cornerstoneWADOImageLoader.wadouri.loadImage);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      const byteArray = new Uint8Array(e.target.result);
      const dataSet = dicomParser.parseDicom(byteArray);
      setMetadata(extractDicomMetadata(dataSet));

      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      cornerstone.loadImage(imageId)
        .then((image) => cornerstone.displayImage(element, image))
        .catch((err) => console.error("Failed to load image:", err));

      element.addEventListener("wheel", (event) => {
        event.preventDefault();
        const viewport = cornerstone.getViewport(element);
        const zoomFactor = 1.05;
        viewport.scale *= event.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
        cornerstone.setViewport(element, viewport);
      });
    };

    reader.readAsArrayBuffer(file);
    return () => cornerstone.disable(element);
  }, [file]);

  const displayedMetadata = isAnonymized ? anonymizeMetadata(metadata) : metadata;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#121212",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating Top Bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(6px)",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 600, letterSpacing: "0.5px" }}>
          MedInsight DICOM Viewer
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="file"
            accept=".dcm"
            onChange={(e) => {
              setFile(e.target.files[0]);
              setMetadata({});
            }}
            style={{
              padding: "6px",
              background: "#1f1f1f",
              color: "white",
              border: "1px solid #444",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          />

          {file && (
            <button
              onClick={() => setIsAnonymized(!isAnonymized)}
              style={{
                background: isAnonymized ? "#1976d2" : "#ffa000",
                border: "none",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {isAnonymized ? "Show Original" : "Anonymize Info"}
            </button>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "70% 30%",
          height: "100%",
          marginTop: "60px",
        }}
      >
        {/* DICOM Viewer */}
        <div
          ref={elementRef}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          {!file && "Upload a DICOM file to view"}

          {file && (
            <>
              {/* Overlays */}
              <div style={{ position: "absolute", top: 10, left: 12, fontSize: "12px" }}>
                <div>{displayedMetadata["Patient Name"] || "Unknown"}</div>
                <div>ID: {displayedMetadata["Patient ID"] || "Unknown"}</div>
              </div>

              <div style={{ position: "absolute", top: 10, right: 12, fontSize: "12px" }}>
                <div>{displayedMetadata["Study Date"] || "Unknown"}</div>
                <div>{displayedMetadata["Modality"] || "Unknown"}</div>
              </div>

              <div style={{ position: "absolute", bottom: 10, left: 12, fontSize: "12px" }}>
                <div>{displayedMetadata["Institution Name"] || "Unknown"}</div>
              </div>

              <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: "12px" }}>
                <div>{displayedMetadata["Manufacturer"] || "Unknown"}</div>
              </div>
            </>
          )}
        </div>

        {/* Metadata Panel */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            color: "#ccc",
            padding: "16px",
            overflowY: "auto",
            borderLeft: "1px solid #333",
          }}
        >
          <h4 style={{ color: "white", textAlign: "center" }}>DICOM Metadata</h4>
          {Object.keys(metadata).length > 0 ? (
            <MetadataPanel metadata={displayedMetadata} />
          ) : (
            <p style={{ textAlign: "center", color: "#777" }}>
              No metadata available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Viewer;
