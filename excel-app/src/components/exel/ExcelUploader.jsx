import { useState, useRef } from "react";

import { alerta } from '../../utils/Notificaciones';

export default function ExcelUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  // Forma profesional de React para acceder a un elemento HTML
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
      setFile(null);
      // Limpiamos el input usando la referencia
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      // Opcional: Aquí podrías usar tu 'alerta.warning' en lugar de alert
      alerta.warning("Selecciona un archivo primero.");
    }
  };

  // ==========================================
  // EVENTOS DE ARRASTRAR Y SOLTAR (DRAG & DROP)
  // ==========================================
  const handleDragOver = (e) => {
    e.preventDefault(); // Evita que el navegador abra el archivo en otra pestaña
    setIsDragging(true); // Cambia el estado visual
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false); // Restaura el estado visual
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    // Verificamos si se soltó algún archivo
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      // Validación extra de seguridad: verificar que sea un Excel
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
      border: "2px dashed #a0aec0", // Borde punteado moderno
      borderRadius: "5px",
      backgroundColor: "#f8fafc", // Fondo muy suave
      textAlign: "center",
      transition: "all 0.3s ease",
      cursor: isDragging ? "copy" : "default"
    }}>
      {/* 1. INPUT OCULTO: Escondemos el diseño nativo del navegador */}
      <input
        id="fileInput"
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* 2. ZONA VISUAL */}
      <div style={{ marginBottom: "0px" }}>
        <h6 style={{ margin: "0px", color: "#334155", fontSize: "1em" }}>Sube tu tabla de datos</h6>
        <p style={{ margin: 0, fontSize: "0.9em", color: "#64748b" }}>Formatos soportados: .xlsx, .xls</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>

        {/* Etiqueta que actúa como el botón de "Seleccionar archivo" */}
        <label
          htmlFor="fileInput"
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

        {/* Muestra el nombre del archivo con colores dinámicos */}
        <span style={{
          color: file ? "#10b981" : "#94a3b8", // Verde si hay archivo, gris si no
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

      {/* 3. BOTÓN DE SUBIDA DINÁMICO: Solo se muestra si hay un archivo listo */}
      {file && (
        <div style={{ marginTop: "10px", animation: "fadeIn 0.3s ease-in-out" }}>
          <button
            onClick={handleSubmit}
            style={{
              padding: "6px 15px",
              backgroundColor: "#2563eb", // Azul vibrante
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              fontSize: "0.8em",
              cursor: "pointer",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.3)", // Sombra elegante
              transition: "transform 0.1s, backgroundColor 0.2s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#1d4ed8"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#2563eb"}
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