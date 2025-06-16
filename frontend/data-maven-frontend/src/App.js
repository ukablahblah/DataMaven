import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".csv")) {
      setFile(selected);
      setPreview([]);
      setSchema(null);
      setError("");
    } else {
      setError("Only .csv files are supported.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      setFile(droppedFile);
      setPreview([]);
      setSchema(null);
      setError("");
    } else {
      setError("Only .csv files are supported.");
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-csv/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const data = await res.json();
      setPreview(data.preview);
      setSchema(data.schema);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

    return (
        <div
            style={{
                maxWidth: 900,
                margin: "40px auto",
                padding: 30,
                fontFamily: "Segoe UI, sans-serif",
                color: "#222",
            }}
        >
            <h1 style={{ textAlign: "center", marginBottom: 30, color: "#2c3e50" }}>
                DataMaven: CSV Analyzer
            </h1>

            {/* Drag-and-Drop Box */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                style={{
                    border: "2px dashed #3498db",
                    borderRadius: 10,
                    padding: 40,
                    marginBottom: 20,
                    textAlign: "center",
                    color: file ? "#2c3e50" : "#888",
                    background: "#f0f8ff",
                    transition: "background 0.2s ease",
                }}
            >
                {file ? (
                    <p>
                        Selected: <strong>{file.name}</strong>
                    </p>
                ) : (
                    <p>Drag and drop your CSV file here</p>
                )}
            </div>

            {/* File Input + Button */}
            <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{
                        flexGrow: 1,
                        padding: "8px 12px",
                        border: "1px solid #ccc",
                        borderRadius: 5,
                    }}
                />
                <button
                    onClick={uploadFile}
                    disabled={loading}
                    style={{
                        padding: "8px 16px",
                        background: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: 5,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Uploading..." : "Upload & Preview"}
                </button>
            </div>

            {/* Error */}
            {error && <p style={{ color: "crimson", marginBottom: 20 }}>{error}</p>}

            {/* Schema */}
            {schema && (
                <>
                    <h2 style={{ color: "#2c3e50", marginTop: 30 }}>📊 Dataset Schema</h2>
                    <ul style={{ listStyleType: "disc", paddingLeft: 20 }}>
                        <li>
                            <strong>Columns:</strong> {schema.columns.join(", ")}
                        </li>
                        <li>
                            <strong>Types:</strong>{" "}
                            {Object.entries(schema.types)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")}
                        </li>
                        <li>
                            <strong>Null counts:</strong>{" "}
                            {Object.entries(schema.null_counts)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")}
                        </li>
                    </ul>
                </>
            )}

            {/* Preview Table */}
            {preview.length > 0 && (
                <>
                    <h2 style={{ color: "#2c3e50", marginTop: 30 }}>
                        🧾 Preview (first {preview.length} rows)
                    </h2>
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginTop: 10,
                                fontSize: 14,
                                background: "white",
                            }}
                        >
                            <thead>
                            <tr>
                                {Object.keys(preview[0]).map((col) => (
                                    <th
                                        key={col}
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px 12px",
                                            background: "#ecf0f1",
                                            textAlign: "left",
                                        }}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {preview.map((row, i) => (
                                <tr key={i}>
                                    {Object.values(row).map((val, j) => (
                                        <td
                                            key={j}
                                            style={{
                                                border: "1px solid #ddd",
                                                padding: "8px 12px",
                                            }}
                                        >
                                            {val?.toString()}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
