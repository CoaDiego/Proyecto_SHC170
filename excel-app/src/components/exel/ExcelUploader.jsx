import { useState, useRef } from "react";
import { alerta } from '../../utils/Notificaciones';

import "../../styles/components/excel/ExcelUploader.css";

export default function ExcelUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      alerta.warning("Selecciona un archivo primero.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const extension = droppedFile.name.split('.').pop().toLowerCase();
      if (extension === "xlsx" || extension === "xls") {
        setFile(droppedFile);
      } else {
        alerta.warning("Por favor, sube solo archivos de Excel (.xlsx, .xls)");
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="container_uploader"
      style={{
        //  Usamos variables de CSS en lugar de colores fijos
        border: isDragging ? "2px dashed var(--accent-color)" : "2px dashed var(--border-color)",
        backgroundColor: isDragging ? "var(--bg-hover, transparent)" : "var(--bg-card)",
        cursor: isDragging ? "copy" : "default"
      }}
    >
      <input
        id="fileInput"
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="container_formato">
        {/*  Texto principal dinámico */}
        <h6>Sube tu tabla de datos</h6>
        {/*  Texto secundario dinámico */}
        <p>Formatos soportados: .xlsx, .xls</p>
      </div>

      <div className="container_uploader_file">

        <label
          htmlFor="fileInput"
          // Cambiamos el hover de color fijo a una simple opacidad para no pelear con el modo oscuro
          onMouseOver={(e) => e.target.style.opacity = "0.7"}
          onMouseOut={(e) => e.target.style.opacity = "1"}
        >
          Explorar archivos
        </label>

        <span style={{
          color: file ? "var(--accent-color)" : "var(--text-muted)",
          fontStyle: file ? "normal" : "italic",
          fontWeight: file ? "bold" : "normal",
        }}>
          {file ? `${file.name}` : "Ningún archivo seleccionado"}
        </span>
      </div>

      {file && (
        <div className="container_uploader_button">
          <button
            onClick={handleSubmit}
            onMouseOver={(e) => e.target.style.opacity = "0.9"}
            onMouseOut={(e) => e.target.style.opacity = "1"}
            onMouseDown={(e) => e.target.style.transform = "scale(0.97)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            Subir al Servidor
          </button>
        </div>
      )}
    </div>
  );
}