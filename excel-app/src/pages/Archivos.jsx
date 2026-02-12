import { useState, useEffect } from "react";
import ExcelViewer from "../components/ExcelViewer";
import ExcelUploader from "../components/ExcelUploader";
import ExcelContent from "../components/ExcelContent";
import ExcelReader from "../components/ExcelReader";

export default function Archivos() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  
  const [modoSubida, setModoSubida] = useState(true);

  // 1. CARGAR LISTA DE ARCHIVOS
  const loadFiles = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/files");
      const data = await res.json();
      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error("Error cargando archivos:", err);
      setError("No se pudo conectar con el servidor.");
    }
  };

  useEffect(() => { loadFiles(); }, []);

  // 2. FUNCIÓN PARA SUBIR ARCHIVO
  const handleUploadFile = async (fileObj) => {
    if (!fileObj) return;
    const formData = new FormData();
    formData.append("file", fileObj);
    formData.append("autor", "Usuario"); 

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
      if (res.ok) {
        loadFiles();
        alert("Archivo subido correctamente");
      } else {
        const errorData = await res.json();
        alert(`Error al subir: ${errorData.detail?.[0]?.msg || "Error desconocido"}`);
      }
    } catch (err) {
      alert("Error de conexión.");
    }
  };

  // 3. FUNCIÓN PARA ELIMINAR ARCHIVO
  const handleDeleteFile = async (filename) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${filename}"?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/${encodeURIComponent(filename)}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.filename !== filename));
        if (selectedFile === filename) setSelectedFile(null);
      } else {
        alert("No se pudo eliminar el archivo.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <h1 style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "10px" }}>Gestión de Archivos</h1>
      
      {error && <p style={{ color: "red", fontWeight: "bold" }}>Error: {error}</p>}

      {/* SECCIÓN DE HERRAMIENTAS */}
      <div className="upload-section">
        <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setModoSubida(true)}
            style={{ 
              opacity: modoSubida ? 1 : 0.6, 
              borderBottom: modoSubida ? "3px solid var(--accent-color)" : "none" 
            }}
          >
            Subir al Servidor
          </button>
          <button 
            onClick={() => setModoSubida(false)}
            style={{ 
              opacity: !modoSubida ? 1 : 0.6,
              borderBottom: !modoSubida ? "3px solid var(--accent-color)" : "none" 
            }}
          >
            Solo Leer (Local)
          </button>
        </div>

        {modoSubida ? (
           <ExcelUploader onUpload={handleUploadFile} />
        ) : (
           <ExcelReader />
        )}
      </div>

      <div className="files-layout">
        
        {/* COLUMNA IZQUIERDA: LISTA */}
        <div className="panel-section">
          <h3>Archivos en el Servidor</h3>
          <ExcelViewer 
            files={files} 
            onSelect={setSelectedFile} 
            onDelete={handleDeleteFile} 
          />
        </div>

        {/* COLUMNA DERECHA: CONTENIDO */}
        <div className="panel-section">
          <h3>Vista Previa (Servidor)</h3>
          {selectedFile ? (
            <ExcelContent filename={selectedFile} />
          ) : (
            <div style={{ padding: "40px", border: "2px dashed var(--border-color)", color: "var(--text-muted)", textAlign: "center" }}>
              Selecciona un archivo de la lista izquierda para ver su contenido.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}