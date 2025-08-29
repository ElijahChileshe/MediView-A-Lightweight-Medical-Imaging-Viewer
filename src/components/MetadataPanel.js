import React from "react";

function MetadataPanel({ metadata }) {
  return (
    <div className="card p-3">
      <h5 className="card-title">Patient Metadata</h5>
      <ul className="list-group list-group-flush">
        {Object.entries(metadata).map(([key, value]) => (
          <li key={key} className="list-group-item">
            <strong>{key}: </strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MetadataPanel;
