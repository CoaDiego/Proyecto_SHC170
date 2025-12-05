import { useState, useEffect } from "react";
import ExcelViewer from "../components/ExcelViewer";
import ExcelUploader from "../components/ExcelUploader";
import ExcelContent from "../components/ExcelContent";

export default function Archivos() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadFiles();
  }, []);

  // 2. FUNCIÓN PARA SUBIR ARCHIVO (Corrección del Error 422)
  const handleUploadFile = async (fileObj) => {
    if (!fileObj) return;

    const formData = new FormData();
    // Clave "file" para el archivo (Coincide con main.py: file: UploadFile)
    formData.append("file", fileObj);
    
    // --- CORRECCIÓN AQUÍ ---
    // Tu backend EXIGE un campo "autor". Lo enviamos automático.
    formData.append("autor", "Usuario Predeterminado"); 
    // -----------------------

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        loadFiles(); // Recargar lista
        alert("✅ Archivo subido correctamente");
      } else {
        // Si falla, mostramos el error que devuelve el backend
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        alert(`❌ Error al subir: ${errorData.detail?.[0]?.msg || "Verifica la consola"}`);
      }
    } catch (err) {
      console.error("Error de red:", err);
      alert("❌ Error de conexión al intentar subir.");
    }
  };

  // 3. FUNCIÓN PARA ELIMINAR ARCHIVO
  const handleDeleteFile = async (filename) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${filename}"?`)) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/files/${encodeURIComponent(filename)}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.filename !== filename));
        if (selectedFile === filename) setSelectedFile(null);
      } else {
        alert("No se pudo eliminar el archivo.");
      }
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>Gestión de Archivos</h1>
      
      {error && <p style={{ color: "red", fontWeight: "bold" }}>⚠️ {error}</p>}

      {/* SECCIÓN SUPERIOR: SUBIDA */}
      <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "8px", marginBottom: "30px", border: "1px solid #e5e7eb" }}>
        <ExcelUploader onUpload={handleUploadFile} />
      </div>

      <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
        
        {/* COLUMNA IZQUIERDA: LISTA */}
        <div style={{ flex: "1", minWidth: "300px", borderRight: "1px solid #eee", paddingRight: "20px" }}>
          <h3 style={{ color: "#374151" }}> Archivos Disponibles</h3>
          <ExcelViewer 
            files={files} 
            onSelect={setSelectedFile} 
            onDelete={handleDeleteFile} 
          />
        </div>

        {/* COLUMNA DERECHA: CONTENIDO */}
        <div style={{ flex: "2", minWidth: "300px" }}>
          <h3 style={{ color: "#374151" }}> Vista Previa</h3>
          {selectedFile ? (
            <ExcelContent filename={selectedFile} />
          ) : (
            <div style={{ 
                padding: "40px", 
                border: "2px dashed #ccc", 
                borderRadius: "8px", 
                color: "#999", 
                textAlign: "center" 
            }}>
              Selecciona un archivo de la lista para ver su contenido
            </div>
          )}
        </div>

      </div>
    </div>
  );
}