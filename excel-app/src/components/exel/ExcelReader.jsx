import { useState } from "react";
import * as XLSX from "xlsx";
import { DataGrid } from "react-data-grid";

export default function ExcelReader() {
  const [workbook, setWorkbook] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  
  // Estados para RDG
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  
  const [fileName, setFileName] = useState("");

  const processSheet = (ws) => {
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (jsonData.length === 0) return;

      // Convertir array de arrays (Excel puro) a array de objetos para RDG
      // Fila 0 son headers, Fila 1+ son datos
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);

      // Crear columnas para RDG
      const cols = headers.map((h, i) => ({ 
          key: i.toString(), // Usamos índice como key porque los nombres pueden repetirse
          name: h || `Col ${i+1}`,
          resizable: true
      }));

      // Crear filas mapeando índices
      const rowsFormatted = dataRows.map((row) => {
          let rowObj = {};
          headers.forEach((_, index) => {
              rowObj[index.toString()] = row[index];
          });
          return rowObj;
      });

      setColumns(cols);
      setRows(rowsFormatted);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      setWorkbook(wb);
      setSheets(wb.SheetNames);
      setActiveSheetIndex(0);
      processSheet(wb.Sheets[wb.SheetNames[0]]);
    };
    reader.readAsBinaryString(file);
  };

  const handleSheetChange = (e) => {
    if (!workbook) return;
    const newIndex = Number(e.target.value);
    setActiveSheetIndex(newIndex);
    processSheet(workbook.Sheets[sheets[newIndex]]);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ marginBottom: "15px", padding: "15px", border: "1px dashed var(--border-color)", borderRadius: "8px", backgroundColor: "var(--bg-input)" }}>
        <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>Abrir archivo local (Sin subir)</p>
        <input type="file" onChange={handleFile} accept=".xlsx, .xls" />
      </div>

      {rows.length > 0 ? (
        <div style={{ height: '450px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ margin: 0 }}>Vista Local: {fileName}</h4>
            {sheets.length > 0 && (
                <div>
                    <label style={{ marginRight: "10px", fontWeight: "bold" }}>Hoja:</label>
                    <select value={activeSheetIndex} onChange={handleSheetChange}>
                        {sheets.map((name, index) => <option key={index} value={index}>{name}</option>)}
                    </select>
                </div>
            )}
          </div>

          {/* Grilla RDG Read-Only */}
          <DataGrid 
            columns={columns} 
            rows={rows} 
            style={{ blockSize: '100%' }}
            className="rdg-light"
          />
        </div>
      ) : (
        <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Selecciona un archivo.</p>
      )}
    </div>
  );
}