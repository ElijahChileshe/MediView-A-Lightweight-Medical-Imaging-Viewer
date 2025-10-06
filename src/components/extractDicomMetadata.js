// utils/extractDicomMetadata.js

export function extractDicomMetadata(dataSet) {
    return {
      // --- 🧍 Patient Information ---
      "Patient Name": dataSet.string("x00100010") || "Unknown",
      "Patient ID": dataSet.string("x00100020") || "Unknown",
      "Patient Birth Date": dataSet.string("x00100030") || "Unknown",
      "Patient Sex": dataSet.string("x00100040") || "Unknown",
  
      // --- 📅 Study Information ---
      "Study Date": dataSet.string("x00080020") || "Unknown",
      "Study Time": dataSet.string("x00080030") || "Unknown",
      "Study Description": dataSet.string("x00081030") || "Unknown",
      "Accession Number": dataSet.string("x00080050") || "Unknown",
      "Referring Physician": dataSet.string("x00080090") || "Unknown",
  
      // --- 🧾 Series Information ---
      "Series Description": dataSet.string("x0008103e") || "Unknown",
      "Series Number": dataSet.string("x00200011") || "Unknown",
      "Instance Number": dataSet.string("x00200013") || "Unknown",
      "Modality": dataSet.string("x00080060") || "Unknown",
  
      // --- 🏭 Equipment Information ---
      "Manufacturer": dataSet.string("x00080070") || "Unknown",
      "Institution Name": dataSet.string("x00080080") || "Unknown",
      "Station Name": dataSet.string("x00081010") || "Unknown",
      "Device Serial Number": dataSet.string("x00181000") || "Unknown",
      "Software Versions": dataSet.string("x00181020") || "Unknown",
  
      // --- 🩻 Image / Acquisition Info ---
      "Body Part Examined": dataSet.string("x00180015") || "Unknown",
      "Slice Thickness": dataSet.string("x00180050") || "Unknown",
      "KVP": dataSet.string("x00180060") || "Unknown",
      "Exposure Time": dataSet.string("x00181150") || "Unknown",
      "X-Ray Tube Current": dataSet.string("x00181151") || "Unknown",
      "Image Position (Patient)": dataSet.string("x00200032") || "Unknown",
      "Image Orientation (Patient)": dataSet.string("x00200037") || "Unknown",
      "Pixel Spacing": dataSet.string("x00280030") || "Unknown",
      "Rows": dataSet.uint16("x00280010") || "Unknown",
      "Columns": dataSet.uint16("x00280011") || "Unknown",
  
      // --- ⚙️ Additional useful metadata ---
      "SOP Class UID": dataSet.string("x00080016") || "Unknown",
      "SOP Instance UID": dataSet.string("x00080018") || "Unknown",
      "Study Instance UID": dataSet.string("x0020000D") || "Unknown",
      "Series Instance UID": dataSet.string("x0020000E") || "Unknown",
    };
  }
  