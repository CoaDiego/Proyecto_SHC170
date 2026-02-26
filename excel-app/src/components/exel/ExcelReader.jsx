import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { DataGrid } from "react-data-grid";
import { alerta } from '../../utils/Notificaciones';

// Función para convertir números a letras (0->A, 1->B, 26->AA) ¡Igual que Excel!
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

export default function ExcelReader() {
  const [workbook, setWorkbook] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 NUEVO: Estado de carga
  const fileInputRef = useRef(null);

  const resetearEstado = () => {
    setFileName("");
    setWorkbook(null);
    setSheets([]);
    setRows([]);
    setColumns([]);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- LÓGICA OPTIMIZADA ---
  const processSheet = (ws) => {
    try {
      if (!ws) throw new Error("La hoja está vacía o no existe.");

      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      
      if (!jsonData || jsonData.length === 0) {
        setColumns([]);
        setRows([]);
        alerta.warning("Hoja vacía", "La hoja seleccionada no tiene datos.");
        setLoading(false);
        return;
      }

      // 1. Encontrar la fila más larga
      let maxCols = 0;
      jsonData.forEach(row => {
        if (row.length > maxCols) maxCols = row.length;
      });

      if (maxCols === 0) {
        setColumns([]);
        setRows([]);
        setLoading(false);
        return;
      }

      // 2. Construir columnas ESTILO EXCEL (A, B, C, D...)
      const cols = [];
      for (let i = 0; i < maxCols; i++) {
        cols.push({
          key: i.toString(),
          name: getExcelColumnName(i), // Llama a la función para poner "A", "B", etc.
          resizable: true,
          width: 150,
          minWidth: 80
        });
      }

      // 3. Transformar TODAS las filas a datos (sin comernos los títulos)
      const rowsFormatted = jsonData.map((row) => {
        let rowObj = {};
        for (let i = 0; i < maxCols; i++) {
          const cellValue = row[i];
          rowObj[i.toString()] = cellValue !== undefined && cellValue !== null ? String(cellValue) : "";
        }
        return rowObj;
      });

      setColumns(cols);
      setRows(rowsFormatted);

    } catch (err) {
      console.error("Error al construir la tabla:", err);
      resetearEstado();
      alerta.error("Error de formato", "El contenido de esta hoja no se puede mostrar.");
    } finally {
      // 👈 Aseguramos apagar el cartel de cargando al terminar
      setLoading(false); 
    }
  };

  // --- LECTURA DE ARCHIVO CON "CARGANDO" ---
  const procesarArchivoLocal = (file) => {
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== "xlsx" && extension !== "xls") {
      alerta.warning("Formato incorrecto", "Por favor, selecciona solo archivos de Excel (.xlsx, .xls)");
      resetearEstado();
      return; 
    }

    setFileName(file.name);
    setLoading(true); // 👈 ENCENDEMOS EL CARGANDO

    const reader = new FileReader();

    reader.onerror = () => {
      alerta.error("Error del sistema", "No se pudo leer el archivo.");
      resetearEstado();
    };

    reader.onload = (evt) => {
      // Usamos setTimeout para permitir que React dibuje el mensaje de "Cargando..." 
      // antes de que el procesador bloquee la pantalla analizando los 1500+ datos.
      setTimeout(() => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });

          if (!wb.SheetNames || wb.SheetNames.length === 0) {
            throw new Error("El archivo no tiene hojas válidas.");
          }

          setWorkbook(wb);
          setSheets(wb.SheetNames);
          setActiveSheetIndex(0);
          
          processSheet(wb.Sheets[wb.SheetNames[0]]);

        } catch (error) {
          console.error("Error crítico de XLSX:", error);
          alerta.error("Archivo no válido", "Asegúrate de que sea un Excel real y no esté corrupto.");
          resetearEstado();
        }
      }, 50);
    };
    
    reader.readAsBinaryString(file);
  };

  const handleFile = (e) => procesarArchivoLocal(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivoLocal(e.dataTransfer.files[0]);
    }
  };

  const handleSheetChange = (e) => {
    if (!workbook) return;
    setLoading(true); // 👈 Mostrar cargando si cambiamos de hoja
    const newIndex = Number(e.target.value);
    setActiveSheetIndex(newIndex);
    setTimeout(() => {
        processSheet(workbook.Sheets[sheets[newIndex]]);
    }, 50);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          padding: "10px",
          border: isDragging ? "2px dashed #2563eb" : "2px dashed #a0aec0",
          borderRadius: "5px",
          backgroundColor: isDragging ? "#eff6ff" : "#f8fafc",
          textAlign: "center",
          transition: "all 0.3s ease",
          cursor: isDragging ? "copy" : "default"
        }}
      >
        <input
          id="localFileInput"
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFile}
        />

        <div style={{ marginBottom: "0px", pointerEvents: "none" }}>
          <h6 style={{ margin: "0px", color: "#334155", fontSize: "1em" }}>
            {isDragging ? "¡Suelta el archivo aquí!" : "Abre tu tabla local (Solo Lectura)"}
          </h6>
          <p style={{ margin: 0, fontSize: "0.9em", color: "#64748b" }}>Formatos soportados: .xlsx, .xls</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
          <label
            htmlFor="localFileInput"
            style={{
              cursor: "pointer",
              padding: "5px",
              backgroundColor: "#e2e8f0",
              color: "#334155",
              borderRadius: "5px",
              border: "1px solid #cbd5e1",
              transition: "background-color 0.2s",
              fontSize: "0.8em",
              fontWeight: "bold"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#cbd5e1"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#e2e8f0"}
          >
            Explorar archivos
          </label>

          <span style={{
            color: fileName ? "#10b981" : "#94a3b8",
            fontStyle: fileName ? "normal" : "italic",
            fontWeight: fileName ? "bold" : "normal",
            maxWidth: "250px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: "0.8em"
          }}>
            {fileName ? `${fileName}` : "Ningún archivo seleccionado"}
          </span>
        </div>
      </div>

      {/* ==========================================
          MENSAJE DE CARGA (Para Excel gigantes)
      ========================================== */}
      {loading && (
        <div style={{ padding: "30px", textAlign: "center", color: "var(--accent-color)" }}>
           <h4 style={{ margin: 0 }}>⏳ Cargando y procesando datos...</h4>
           <p style={{ fontSize: "0.8em", color: "var(--text-muted)" }}>Esto puede tardar unos segundos dependiendo del tamaño del archivo.</p>
        </div>
      )}

      {/* ==========================================
          VISTA DE LA TABLA RDG
      ========================================== */}
      {!loading && rows.length > 0 && (
        <div style={{ height: '450px', display: 'flex', flexDirection: 'column', marginTop: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h4 style={{ margin: 0 }}>Vista Local: <span style={{ color: 'var(--accent-color)' }}>{fileName}</span></h4>
            {sheets.length > 0 && (
              <div>
                <label style={{ marginRight: "10px", fontWeight: "bold" }}>Hoja:</label>
                <select
                  value={activeSheetIndex}
                  onChange={handleSheetChange}
                  style={{ padding: '5px', borderRadius: '4px' }}
                >
                  {sheets.map((name, index) => <option key={index} value={index}>{name}</option>)}
                </select>
              </div>
            )}
          </div>

          <DataGrid
            columns={columns}
            rows={rows}
            style={{ blockSize: '100%' }}
            className="rdg-light"
          />
        </div>
      )}

    </div>
  );
}