import React, { useEffect, useRef, useState } from "react";
import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import MetadataPanel from "../components/MetadataPanel";

function Viewer() {
  const elementRef = useRef(null);
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    if (!file) return;
  
    const element = elementRef.current;
    cornerstone.enable(element);
  
    // Link dependencies
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstone.registerImageLoader('wadouri', cornerstoneWADOImageLoader.wadouri.loadImage);
  
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
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      const byteArray = new Uint8Array(arrayBuffer);
      const dataSet = dicomParser.parseDicom(byteArray);
  
      setMetadata({
        "Patient Name": dataSet.string("x00100010") || "Unknown",
        "Patient ID": dataSet.string("x00100020") || "Unknown",
        "Modality": dataSet.string("x00080060") || "Unknown",
        "Study Date": dataSet.string("x00080020") || "Unknown",
      });
  
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
  
      cornerstone.loadImage(imageId)
        .then(image => cornerstone.displayImage(element, image))
        .catch(err => console.error("Failed to load image:", err));
    };
  
    reader.readAsArrayBuffer(file);
  
    return () => cornerstone.disable(element);
  }, [file]);
  

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">DICOM Viewer</h2>

      <div className="mb-3 text-center">
        <input
          type="file"
          accept=".dcm"
          onChange={e => { setFile(e.target.files[0]); setMetadata({}); }}
          className="form-control"
        />
      </div>

      <div
        ref={elementRef}
        style={{ width: "512px", height: "512px", backgroundColor: "black", margin: "auto" }}
      ></div>

      {Object.keys(metadata).length > 0 && (
        <div className="mt-4">
          <MetadataPanel metadata={metadata} />
        </div>
      )}
    </div>
  );
}

export default Viewer;
