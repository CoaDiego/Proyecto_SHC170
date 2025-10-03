import { useEffect, useState } from "react";
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import Calculadora_Excel from "../components/Calculadora_Excel";

export default function Calculadora() {
  const [files, setFiles] = useState([]);               // cada file = { filename, author }
  const [selectedFile, setSelectedFile] = useState(""); // solo el nombre del archivo
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");

  // =======================
  // Cargar lista de archivos
  // =======================
  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
          if (data.files.length > 0) {
            setSelectedFile(data.files[0].filename); // ⚡ solo filename
          }
        }
      })
      .catch((err) => console.error("Error al cargar archivos:", err));
  }, []);

  // =======================
  // Cargar hojas del archivo seleccionado
  // =======================
  useEffect(() => {
    if (!selectedFile) return;

    fetch(`http://127.0.0.1:8000/sheets/${encodeURIComponent(selectedFile)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sheets) {
          setSheets(data.sheets);
          setSelectedSheet(0); // primera hoja por defecto
        } else {
          setSheets([]);
          setSelectedSheet("");
        }
      })
      .catch((err) => console.error("Error al cargar hojas:", err));
  }, [selectedFile]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6"> - Archivos Subidos - </h2>

      {/* Selector de archivo */}
      <label className="block mb-2 font-semibold">Selecciona un archivo:</label>
      <select
        value={selectedFile}
        onChange={(e) => setSelectedFile(e.target.value)}
        className="border p-2 rounded"
      >
        {files.map((file) => (
          <option key={file.filename} value={file.filename}>
            {file.filename} ({file.author || "Desconocido"})
          </option>
        ))}
      </select>

      {/* Vista previa del archivo + su propio selector */}
      {selectedFile && (
        <div style={{ marginTop: "20px" }}>
        
          <ExcelContent
  filename={selectedFile}
  onSheetChange={(index) => setSelectedSheet(index)} // 
/>

        </div>
      )}

      <p className="mt-4">
        Archivo en uso: <b>{selectedFile}</b>
      </p>

      {/* Calculadora Excel */}
      {selectedFile && selectedSheet !== "" && (
        <Calculadora_Excel
          filename={selectedFile}
          sheet={selectedSheet}
          usarTodaHoja={false}
        />
      )}

      {/* Calculadora general */}
      <Calculator />
    </div>
  );
}
