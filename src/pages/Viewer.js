import React, { useEffect, useRef, useState } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import MetadataPanel from "../components/MetadataPanel";
import { extractDicomMetadata } from "../components/extractDicomMetadata";
import { anonymizeMetadata } from "../components/anonymize";
import "./Viewer.css";

const Viewer = () => {
  const elementRef = useRef(null); // Reference to the DICOM viewer DOM element
  const [files, setFiles] = useState([]); // Array of loaded DICOM files
  const [currentIndex, setCurrentIndex] = useState(0); // Index of the current file being displayed
  const [metadata, setMetadata] = useState({}); // Metadata for the current DICOM file
  const [isAnonymized, setIsAnonymized] = useState(false); // Flag to toggle anonymization

  // Effect to load and display the current DICOM file whenever the file list or index changes
  useEffect(() => {
    if (files.length === 0) return; // No files, nothing to do

    const file = files[currentIndex];
    const element = elementRef.current;

    // Enable Cornerstone on the viewer element
    cornerstone.enable(element);

    // Set up the WADO image loader with Cornerstone and dicom-parser
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstone.registerImageLoader(
      "wadouri",
      cornerstoneWADOImageLoader.wadouri.loadImage
    );

    // Initialize web worker for decoding DICOM images
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

    // Read the file as an ArrayBuffer to parse DICOM metadata
    const reader = new FileReader();
    reader.onload = (e) => {
      const byteArray = new Uint8Array(e.target.result);
      const dataSet = dicomParser.parseDicom(byteArray);
      setMetadata(extractDicomMetadata(dataSet)); // Extract metadata for display

      // Load and display the image in the viewer
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      cornerstone
        .loadImage(imageId)
        .then((image) => cornerstone.displayImage(element, image))
        .catch((err) => console.error("Failed to load image:", err));
    };

    reader.readAsArrayBuffer(file);

    // Cleanup: disable Cornerstone when component unmounts or changes file
    return () => cornerstone.disable(element);
  }, [files, currentIndex]);

  // Effect to handle mouse wheel events for scrolling through slices or zooming
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleWheel = (event) => {
      event.preventDefault();
      if (files.length > 1) {
        // Scroll through multiple files using the wheel
        setCurrentIndex((i) =>
          event.deltaY > 0 ? (i + 1) % files.length : (i - 1 + files.length) % files.length
        );
      } else {
        // Zoom in/out if only one file
        const viewport = cornerstone.getViewport(element);
        const zoomFactor = 1.05;
        viewport.scale *= event.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
        cornerstone.setViewport(element, viewport);
      }
    };

    element.addEventListener("wheel", handleWheel);
    return () => element.removeEventListener("wheel", handleWheel);
  }, [files]);

  // Effect to allow scrolling through files using keyboard arrow keys
  useEffect(() => {
    const handleKey = (event) => {
      if (files.length > 1) {
        if (event.key === "ArrowRight") {
          setCurrentIndex((i) => (i + 1) % files.length);
        } else if (event.key === "ArrowLeft") {
          setCurrentIndex((i) => (i - 1 + files.length) % files.length);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [files]);

  // Determine which metadata to display based on anonymization toggle
  const displayedMetadata = isAnonymized ? anonymizeMetadata(metadata) : metadata;

  return (
    <div className="viewer-container">
      {/* Top bar with file input and controls */}
      <div className="viewer-topbar">
        <h3 className="viewer-title">MedInsight DICOM Viewer</h3>
        <div className="viewer-controls">
          <input
            type="file"
            accept=".dcm"
            multiple
            onChange={(e) => {
              setFiles(Array.from(e.target.files)); // Load multiple files
              setCurrentIndex(0); // Reset to first file
              setMetadata({});
            }}
          />
          {files.length > 0 && (
            <button
              onClick={() => setIsAnonymized(!isAnonymized)}
              className={`anonymize-button ${isAnonymized ? "active" : ""}`}
            >
              {isAnonymized ? "Show Original" : "Anonymize Info"}
            </button>
          )}
          {files.length > 1 && (
            <>
              {/* Buttons to navigate slices */}
              <button onClick={() => setCurrentIndex((i) => (i - 1 + files.length) % files.length)}>
                Previous
              </button>
              <button onClick={() => setCurrentIndex((i) => (i + 1) % files.length)}>
                Next
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main layout with DICOM viewer and metadata panel */}
      <div className="viewer-main">
        {/* DICOM display area */}
        <div ref={elementRef} className="dicom-viewer">
          {files.length === 0 && "Upload DICOM files to view"}
          {files.length > 0 && (
            <>
              {/* Overlay metadata */}
              <div className="overlay top-left">
                <div>{displayedMetadata["Patient Name"] || "Unknown"}</div>
                <div>ID: {displayedMetadata["Patient ID"] || "Unknown"}</div>
                <div>Birth Date: {displayedMetadata["Patient Birth Date"] || "Unknown"}</div>
                <div>Sex: {displayedMetadata["Patient Sex"] || "Unknown"}</div>
                <div>Age: {displayedMetadata["Patient Age"] || "Unknown"}</div>
              </div>
              <div className="overlay top-right">
                <div>{displayedMetadata["Study Date"] || "Unknown"}</div>
                <div>{displayedMetadata["Study Instance UID"] || "Unknown"}</div>
                <div>{displayedMetadata["Study Description"] || "Unknown"}</div>
                <div>{displayedMetadata["Modality"] || "Unknown"}</div>
              </div>
              <div className="overlay bottom-left">
                <div>{displayedMetadata["Institution Name"] || "Unknown"}</div>
                <div>{displayedMetadata["Frame"] || "Unknown"}</div>
                <div>Rows: {displayedMetadata["Rows"] || "Unknown"}</div>
                <div>Exposure Time: {displayedMetadata["Exposure Time"] || "Unknown"}</div>
              </div>
              <div className="overlay bottom-right">
                <div>{displayedMetadata["Manufacturer"] || "Unknown"}</div>
              </div>
            </>
          )}
        </div>
        

        {/* Metadata panel */}
        <div className="metadata-panel">
          <h4>DICOM Metadata</h4>
          {Object.keys(metadata).length > 0 ? (
            <MetadataPanel metadata={displayedMetadata} />
          ) : (
            <p>No metadata available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Viewer;
