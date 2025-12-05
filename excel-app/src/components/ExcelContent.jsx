import { useState, useEffect } from "react";

// Agregamos onSheetChange y mostrarTabla a las props recibidas
export default function ExcelContent({ filename, onSheetChange, mostrarTabla = true }) {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Cargar las HOJAS cuando cambia el archivo
  useEffect(() => {
    if (!filename) return;

    setSheets([]);
    setData([]);
    setSelectedSheet(0);
    setError("");
    
    // IMPORTANTE: Avisar al padre que al cambiar archivo, volvemos a la hoja 0
    if(onSheetChange) onSheetChange(0);

    fetch(`http://127.0.0.1:8000/sheets/${encodeURIComponent(filename)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.sheets && json.sheets.length > 0) {
          setSheets(json.sheets);
        } else {
          setError("El archivo no tiene hojas visibles o no se pudo leer.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Error de conexión al cargar hojas.");
      });
  }, [filename]); // Quitamos onSheetChange de dependencias para evitar loops

  // 2. Cargar los DATOS cuando cambia la hoja seleccionada
  useEffect(() => {
    // Si no debemos mostrar tabla, no hacemos el fetch de datos para ahorrar recursos
    if (!filename || sheets.length === 0 || !mostrarTabla) return;

    setLoading(true);
    fetch(`http://127.0.0.1:8000/view/${encodeURIComponent(filename)}?hoja=${selectedSheet}`)
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [filename, selectedSheet, sheets, mostrarTabla]);

  // Manejador para el cambio de hoja
  const handleSheetChange = (e) => {
      const newIndex = Number(e.target.value);
      setSelectedSheet(newIndex);
      // AQUÍ ESTÁ LA MAGIA: Avisamos al componente padre (Calculadora)
      if (onSheetChange) {
          onSheetChange(newIndex);
      }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", marginBottom: "15px" }}>
      {/* CAMBIO VISUAL: Título solicitado */}
      <h3 style={{ marginTop: 0, fontSize: '1.1em' }}>Archivo en uso: {filename}</h3>

      {/* Selector de Hojas */}
      {sheets.length > 0 && (
        <div style={{ marginBottom: mostrarTabla ? "15px" : "0" }}>
          <label style={{ fontWeight: "bold", marginRight: "10px" }}>Hoja:</label>
          <select 
            value={selectedSheet} 
            onChange={handleSheetChange} // Usamos la nueva función
            style={{ padding: "5px" }}
          >
            {sheets.map((sheetName, index) => (
              <option key={index} value={index}>
                {sheetName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Solo mostramos la tabla si la prop mostrarTabla es true */}
      {mostrarTabla && (
          loading ? (
            <p>Cargando datos...</p>
          ) : data.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table border="1" style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#f4f4f4" }}>
                    {Object.keys(data[0]).map((col) => (
                      <th key={col} style={{ padding: "8px", textAlign: "left" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ padding: "6px" }}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontStyle: "italic", color: "#666" }}>Esta hoja está vacía.</p>
          )
      )}
    </div>
  );
}