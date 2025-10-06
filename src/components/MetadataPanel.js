// components/MetadataPanel.js

import React from "react";

/**
 * MetadataPanel Component
 * -----------------------
 * Displays DICOM metadata in a clean, scrollable list.
 * Each metadata field is shown as a key-value pair in a styled card.
 *
 * Props:
 *   - metadata: object containing DICOM metadata, where keys are labels
 *               and values are the corresponding DICOM data.
 */
const MetadataPanel = ({ metadata }) => {
  return (
    // Container for all metadata entries
    <div style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
      
      {/* Iterate over metadata object entries */}
      {Object.entries(metadata).map(([key, value]) => (
        
        // Individual metadata item card
        <div
          key={key}
          style={{
            backgroundColor: "#f9fafb",       // subtle light background
            marginBottom: "8px",               // spacing between cards
            padding: "10px 14px",              // inner padding
            borderRadius: "8px",               // rounded corners
            border: "1px solid #e5e7eb",      // light border for separation
            display: "flex",                   // use flexbox for key-value layout
            justifyContent: "space-between",   // key left, value right
            alignItems: "center",              // vertically center content
          }}
        >
          {/* Metadata key / label */}
          <span style={{ fontWeight: 600, color: "#374151" }}>
            {key}
          </span>

          {/* Metadata value */}
          <span style={{ color: "#4b5563", textAlign: "right" }}>
            {value || "—"}  {/* fallback for missing values */}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MetadataPanel;
