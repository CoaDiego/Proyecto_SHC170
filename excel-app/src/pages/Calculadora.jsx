import { useEffect, useState } from "react";
import Calculator from "../components/Calculator";
import ExcelContent from "../components/ExcelContent";
import Calculadora_Excel from "../components/Calculadora_Excel";

export default function Calculadora() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");


  // Cargar lista de archivos al montar el componente
  useEffect(() => {
    fetch("http://127.0.0.1:8000/files")
      .then((res) => res.json())
      .then((data) => {
        setFiles(data.files);
        if (data.files.length > 0) {
          setSelectedFile(data.files[0]); // seleccionar el primero por defecto
        }
      })
      .catch((err) => console.error("Error al cargar archivos:", err));
  }, []);
  
   // Cargar hojas cuando se cambia el archivo seleccionado
  useEffect(() => {
    if (!selectedFile) return;
    fetch(`http://127.0.0.1:8000/sheets/${selectedFile}`)
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
      <h2 className="text-2xl font-bold mb-6">Archivos Subidos</h2>

      {/* Selector de archivo */}
      <label className="block mb-2 font-semibold">Selecciona un archivo:</label>
      <select
        value={selectedFile}
        onChange={(e) => setSelectedFile(e.target.value)}
        className="border p-2 rounded"
      >
        {files.map((file) => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
      </select>

       {/* Vista previa del archivo seleccionado */}
            {selectedFile && (
              <div style={{ marginTop: "20px" }}>
                <ExcelContent filename={selectedFile} />
              </div>
            )}
      

      <p className="mt-4">
        Archivo en uso: <b>{selectedFile}</b>
      </p>


        {/* Selector de hoja */}
      {sheets.length > 0 && (
        <>
        <br />
          <label className="block mb-2 font-semibold">Selecciona una hoja:</label>
          <select
            value={selectedSheet}
            /* onChange={(e) => setSelectedSheet(e.target.value)} */
            onChange={(e) => setSelectedSheet(Number(e.target.value))}
            className="border p-2 rounded mb-4"
          >
            {sheets.map((sheet, index) => (
              <option key={index} value={index}>
                {sheet}
              </option>
            ))}
          </select>
        </>
      )}
      
      {selectedFile && selectedSheet !== "" && (
        <Calculadora_Excel 
  filename={selectedFile} 
  sheet={selectedSheet} 
  usarTodaHoja={false} 
/>



)}
  
      <Calculator /> {/*Calculadora*/}


    </div>
  );
}
