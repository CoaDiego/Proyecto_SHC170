import { useState, useRef } from "react";
import { alerta } from '../../utils/Notificaciones';

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
      style={{
        padding: "10px",
        // 👇 Usamos variables de CSS en lugar de colores fijos
        border: isDragging ? "2px dashed var(--accent-color)" : "2px dashed var(--border-color)", 
        borderRadius: "5px",
        backgroundColor: isDragging ? "var(--bg-hover, transparent)" : "var(--bg-card)", 
        textAlign: "center",
        transition: "all 0.3s ease",
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

      <div style={{ marginBottom: "0px" }}>
        {/* 👇 Texto principal dinámico */}
        <h6 style={{ margin: "0px", color: "var(--text-main)", fontSize: "1em" }}>Sube tu tabla de datos</h6>
        {/* 👇 Texto secundario dinámico */}
        <p style={{ margin: 0, fontSize: "0.9em", color: "var(--text-muted)" }}>Formatos soportados: .xlsx, .xls</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>

        <label
          htmlFor="fileInput"
          style={{
            cursor: "pointer",
            padding: "5px 10px",
            // 👇 Botón de explorar responsivo al tema
            backgroundColor: "var(--bg-input, transparent)",
            color: "var(--text-main)",
            borderRadius: "5px",
            border: "1px solid var(--border-color)",
            transition: "opacity 0.2s",
            fontSize: "0.8em",
            fontWeight: "bold"
          }}
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
          maxWidth: "250px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "0.8em"
        }}>
          {file ? `${file.name}` : "Ningún archivo seleccionado"}
        </span>
      </div>

      {file && (
        <div style={{ marginTop: "10px", animation: "fadeIn 0.3s ease-in-out" }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "6px 15px",
              backgroundColor: "var(--accent-color, #2563eb)", 
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              fontSize: "0.8em",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(0,0,0, 0.2)", 
              transition: "transform 0.1s, opacity 0.2s"
            }}
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