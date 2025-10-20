// /anonymize.js

// Simple function to anonymize patient-related DICOM metadata
export function anonymizeMetadata(metadata) {
    const anonymized = { ...metadata };
    if (anonymized["Patient Name"]) anonymized["Patient Name"] = "ANONYMIZED";
    if (anonymized["Patient ID"]) anonymized["Patient ID"] = "000000";
    if (anonymized["Patient Birth Date"]) anonymized["Patient Birth Date"] = "YYYYMMDD";
    if (anonymized["Patient Sex"]) anonymized["Patient Sex"] = "U"; // Unknown
    return anonymized;
  }
  