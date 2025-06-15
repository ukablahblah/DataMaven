import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setPreview([]);
    setSchema(null);
    setError("");
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
      <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
        <h2>DataMaven CSV Upload & Preview</h2>

        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={uploadFile} disabled={loading}>
          {loading ? "Uploading..." : "Upload & Preview"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {schema && (
            <>
              <h3>Dataset Schema</h3>
              <ul>
                <li>Columns: {schema.columns.join(", ")}</li>
                <li>
                  Types:{" "}
                  {Object.entries(schema.types)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                </li>
                <li>
                  Null counts:{" "}
                  {Object.entries(schema.null_counts)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")}
                </li>
              </ul>
            </>
        )}

        {preview.length > 0 && (
            <>
              <h3>Preview (first {preview.length} rows)</h3>
              <table
                  border="1"
                  cellPadding="5"
                  style={{ borderCollapse: "collapse", width: "100%" }}
              >
                <thead>
                <tr>
                  {Object.keys(preview[0]).map((col) => (
                      <th key={col}>{col}</th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                          <td key={j}>{val?.toString()}</td>
                      ))}
                    </tr>
                ))}
                </tbody>
              </table>
            </>
        )}
      </div>
  );
}

export default App;
