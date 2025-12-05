import { useState, useEffect } from "react";

export default function ExcelContent({ filename, onSheetChange, mostrarTabla = true }) {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!filename) return;
    setSheets([]); setData([]); setSelectedSheet(0); setError("");
    if(onSheetChange) onSheetChange(0);

    fetch(`http://127.0.0.1:8000/sheets/${encodeURIComponent(filename)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.sheets && json.sheets.length > 0) setSheets(json.sheets);
        else setError("El archivo no tiene hojas visibles.");
      })
      .catch(() => setError("Error de conexión."));
  }, [filename]);

  useEffect(() => {
    if (!filename || sheets.length === 0 || !mostrarTabla) return;
    setLoading(true);
    fetch(`http://127.0.0.1:8000/view/${encodeURIComponent(filename)}?hoja=${selectedSheet}`)
      .then((res) => res.json())
      .then((json) => Array.isArray(json) ? setData(json) : setData([]))
      .finally(() => setLoading(false));
  }, [filename, selectedSheet, sheets, mostrarTabla]);

  const handleSheetChange = (e) => {
      const newIndex = Number(e.target.value);
      setSelectedSheet(newIndex);
      if (onSheetChange) onSheetChange(newIndex);
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    // AQUÍ ELIMINAMOS background: #fff y usamos border-color variable
    <div style={{ padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", marginBottom: "15px" }}>
      <h3 style={{ marginTop: 0, fontSize: '1.1em' }}>Archivo en uso: {filename}</h3>

      {sheets.length > 0 && (
        <div style={{ marginBottom: mostrarTabla ? "15px" : "0" }}>
          <label style={{ fontWeight: "bold", marginRight: "10px" }}>Hoja:</label>
          <select value={selectedSheet} onChange={handleSheetChange} style={{ padding: "5px" }}>
            {sheets.map((sheetName, index) => (
              <option key={index} value={index}>{sheetName}</option>
            ))}
          </select>
        </div>
      )}

      {mostrarTabla && (
          loading ? <p>Cargando datos...</p> : data.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              {/* Usamos className="tabla-academica" en lugar de styles inline */}
              <table className="tabla-academica">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Hoja vacía.</p>
      )}
    </div>
  );
}