import { useState, useEffect } from "react";
import { DataGrid } from "react-data-grid"; // 👈 SOLO DataGrid
import "react-data-grid/lib/styles.css"; // (Opcional si ya está en App.css)

// --- EDITOR MANUAL ---
function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      style={{ width: '100%', border: 'none', padding: '0 5px', outline: 'none' }}
      autoFocus
      value={row[column.key]}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
    />
  );
}

export default function ExcelContent({ filename, onSheetChange, mostrarTabla = true }) {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!filename) return;
    setSheets([]); setRows([]); setColumns([]); setSelectedSheet(0); setError("");
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
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          const rawKeys = Object.keys(json[0]);
          const cols = rawKeys.map((key) => ({
            key: key,
            name: key,
            resizable: true,
            sortable: true,
            renderEditCell: textEditor, // 👈 USAMOS LA FUNCIÓN LOCAL
            // Ya no usamos 'editor', usamos 'renderEditCell' en v7
          }));

          setColumns(cols);
          setRows(json);
        } else {
          setRows([]);
          setColumns([]);
        }
      })
      .finally(() => setLoading(false));
  }, [filename, selectedSheet, sheets, mostrarTabla]);

  const handleSheetChange = (e) => {
      const newIndex = Number(e.target.value);
      setSelectedSheet(newIndex);
      if (onSheetChange) onSheetChange(newIndex);
  };

  const handleRowsChange = (newRows) => {
    setRows(newRows);
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px", marginBottom: "15px", display: 'flex', flexDirection: 'column', height: mostrarTabla ? '500px' : 'auto' }}>
      <div style={{ marginBottom: "10px" }}>
          <h3 style={{ margin: 0, fontSize: '1.1em' }}>Archivo en uso: <br /> {filename}</h3> <br />
          {sheets.length > 0 && (
            <div style={{ marginTop: "5px" }}>
              <label style={{ fontWeight: "bold", marginRight: "10px" }}>Hoja:</label>
              <select value={selectedSheet} onChange={handleSheetChange} style={{ padding: "5px" }}>
                {sheets.map((sheetName, index) => (
                  <option key={index} value={index}>{sheetName}</option>
                ))}
              </select>
              <span style={{ marginLeft: "15px", fontSize: "0.8em", color: "var(--accent-color)" }}>
                Edición Activa
              </span>
            </div>
          )}
      </div>

      {mostrarTabla && (
          loading ? <p>Cargando datos...</p> : rows.length > 0 ? (
            <DataGrid 
                columns={columns} 
                rows={rows} 
                onRowsChange={handleRowsChange} 
                className="rdg-light" 
                style={{ blockSize: '100%' }} 
            />
          ) : <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Hoja vacía.</p>
      )}
    </div>
  );
}