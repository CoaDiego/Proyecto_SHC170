import { useState, useEffect } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { api } from "../../services/api";

// --- FUNCIÓN PARA LETRAS DE COLUMNAS (A, B, C...) ---
const getExcelColumnName = (colIndex) => {
  let dividend = colIndex + 1;
  let colName = '';
  let modulo;
  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    colName = String.fromCharCode(65 + modulo) + colName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return colName;
};

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

  // 1. CARGAR HOJAS
  useEffect(() => {
    if (!filename) return;
    setSheets([]); setRows([]); setColumns([]); setSelectedSheet(0); setError("");
    if (onSheetChange) onSheetChange(0);

    const fetchHojas = async () => {
      try {
        const json = await api.obtenerHojas(filename);
        if (json.sheets && json.sheets.length > 0) {
          setSheets(json.sheets);
        } else {
          setError("El archivo no tiene hojas visibles.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al conectar con el servidor.");
      }
    };

    fetchHojas();

    // 👇 ESTA ES LA LÍNEA QUE ARREGLA EL ERROR (se borró onSheetChange)
  }, [filename,onSheetChange]);

  // 2. CARGAR DATOS DE LA HOJA
  useEffect(() => {
    if (!filename || sheets.length === 0 || !mostrarTabla) return;
    setLoading(true);

    const fetchDatos = async () => {
      try {
        const json = await api.obtenerDatosHoja(filename, selectedSheet);

        if (Array.isArray(json) && json.length > 0) {
          const rawKeys = Object.keys(json[0]);

          const cols = rawKeys.map((key, index) => ({
            key: key,
            name: getExcelColumnName(index),
            resizable: true,
            sortable: true,
            width: 150,
            minWidth: 80,
            renderEditCell: textEditor,
          }));

          const headerRow = {};
          rawKeys.forEach(key => {
            headerRow[key] = key.startsWith("Unnamed:") ? "" : key;
          });

          setColumns(cols);
          setRows([headerRow, ...json]);
        } else {
          setRows([]);
          setColumns([]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos de la hoja.");
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [filename, selectedSheet, sheets, mostrarTabla]);

  const handleSheetChange = (e) => {
    const newIndex = Number(e.target.value);
    setSelectedSheet(newIndex);
    if (onSheetChange) onSheetChange(newIndex);
  };

  const handleRowsChange = (newRows) => {
    setRows(newRows);
  };

  if (error) return (
    <div style={{ padding: "20px", border: "1px dashed #ef4444", borderRadius: "8px", color: "#ef4444", textAlign: "center" }}>
      <strong>Error:</strong> {error}
    </div>
  );

  return (
    <div style={{
      padding: "15px",
      border: "1px solid var(--border-color)",
      borderRadius: "10px",
      marginBottom: "15px",
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: "var(--bg-card)",
      height: mostrarTabla ? '550px' : 'auto',
      width: '100%',
      maxWidth: '100%',
      minWidth: 0, // 👈 Muy importante para evitar desbordes
      overflow: 'hidden'
    }}>

      {/* CABECERA DEL CONTENIDO (AHORA SÍ ES RESPONSIVA) */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start", // Alinea arriba si hace salto de línea
        flexWrap: "wrap", // 👈 ESTO ES MAGIA: Permite que los elementos bajen si no caben
        gap: "15px", // Espacio cuando hacen salto de línea
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "10px",
        marginBottom: "15px"
      }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: "1", minWidth: "150px", overflow: "hidden" }}>
          <h5 style={{ margin: 0, color: "var(--text-main)" }}>Archivo en uso</h5>
          <span style={{
            color: "var(--accent-color)",
            fontSize: "0.85em",
            // 👇 ESTAS 3 LÍNEAS SON OBLIGATORIAS PARA EL EFECTO "..."
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
            width: "100%"
          }}>
            {filename}
          </span>
        </div>

        {sheets.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8em", color: "#10b981", backgroundColor: "#d1fae5", padding: "3px 8px", borderRadius: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>
              Edición Activa
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <label style={{ fontWeight: "bold", color: "var(--text-main)", fontSize: "0.8em" }}>Hoja:</label>
              <select
                value={selectedSheet}
                onChange={handleSheetChange}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                  outline: "none",
                  maxWidth: "130px", // Evita que un nombre de hoja muy largo rompa el diseño
                  fontSize: "0.85rem"
                }}
              >
                {sheets.map((sheetName, index) => (
                  <option key={index} value={index}>{sheetName}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TABLA O ESTADO DE CARGA */}
      {mostrarTabla && (
        loading ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--accent-color)" }}>
            <h3>Cargando datos desde el servidor...</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9em" }}>Esto puede tardar dependiendo del tamaño del archivo.</p>
          </div>
        ) : rows.length > 0 ? (
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            <DataGrid
              columns={columns}
              rows={rows}
              onRowsChange={handleRowsChange}
              className="rdg-light"
              style={{
                height: '100%',
                width: '100%',
                borderRadius: "6px",
                border: "1px solid var(--border-color)"
              }}
            />
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Hoja vacía.</p>
          </div>
        )
      )}
    </div>
  );
}