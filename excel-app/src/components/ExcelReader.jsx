import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelReader() {
  const [workbook, setWorkbook] = useState(null); // Guardamos el objeto libro completo
  const [sheets, setSheets] = useState([]);       // Lista de nombres de hojas
  const [activeSheetIndex, setActiveSheetIndex] = useState(0); // Índice hoja actual
  const [data, setData] = useState([]);           // Datos de la hoja actual
  const [fileName, setFileName] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      
      // 1. Guardar metadatos iniciales
      setWorkbook(wb);
      setSheets(wb.SheetNames);
      setActiveSheetIndex(0);

      // 2. Cargar datos de la primera hoja por defecto
      const firstSheetName = wb.SheetNames[0];
      const ws = wb.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSheetChange = (e) => {
    if (!workbook) return;

    const newIndex = Number(e.target.value);
    setActiveSheetIndex(newIndex);

    // Obtener nombre de la hoja basado en el índice
    const sheetName = sheets[newIndex];
    const ws = workbook.Sheets[sheetName];
    
    // Convertir esa hoja específica a JSON
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
    setData(jsonData);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ marginBottom: "15px", padding: "15px", border: "1px dashed var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-input)" }}>
        <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>Abrir archivo local (Sin subir al servidor)</p>
        <input type="file" onChange={handleFile} accept=".xlsx, .xls" />
      </div>

      {data.length > 0 ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "10px" }}>
            <h4 style={{ margin: 0 }}>Vista Local: {fileName}</h4>
            
            {/* Selector de Hojas Local */}
            {sheets.length > 0 && (
                <div>
                    <label style={{ marginRight: "10px", fontWeight: "bold" }}>Hoja:</label>
                    <select value={activeSheetIndex} onChange={handleSheetChange}>
                        {sheets.map((name, index) => (
                            <option key={index} value={index}>{name}</option>
                        ))}
                    </select>
                </div>
            )}
          </div>

          <div style={{ overflowX: "auto", maxHeight: "400px", border: "1px solid var(--border-color)" }}>
            <table className="tabla-academica">
              <thead>
                <tr>
                  {data[0].map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
          Selecciona un archivo para previsualizarlo aquí.
        </p>
      )}
    </div>
  );
}