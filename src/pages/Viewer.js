import React, { useEffect, useRef } from "react";
import * as cornerstone from "cornerstone-core";
import * as dicomParser from "dicom-parser";

function Viewer() {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    cornerstone.enable(element);

    // Later: replace this with uploaded DICOM
    // Currently just a black placeholder
    element.style.backgroundColor = "black";

    return () => {
      cornerstone.disable(element);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-lg font-bold mb-4">DICOM Viewer</h2>
      <div
        ref={elementRef}
        style={{ width: "512px", height: "512px" }}
      ></div>
    </div>
  );
}

export default Viewer;
