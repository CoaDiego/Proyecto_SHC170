
import { useState } from "react";

export default function ExcelUploader({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (file) {
      onUpload(file); // Le pasa el archivo al padre (Archivos.jsx)
      setFile(null);  // Limpia el estado local
      // Limpiar input visualmente
      document.getElementById("fileInput").value = "";
    } else {
      alert("Selecciona un archivo primero.");
    }
  };

  return (
    <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
      <h3>Subir Archivo</h3>
      <input 
        id="fileInput"
        type="file" 
        accept=".xlsx, .xls"
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>
        Subir
      </button>
    </div>
  );
}