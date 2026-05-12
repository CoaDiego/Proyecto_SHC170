import { useState, useEffect } from "react";
import ExcelViewer from "../components/excel/ExcelViewer";
import ExcelUploader from "../components/excel/ExcelUploader";
import ExcelContent from "../components/excel/ExcelContent";
import ExcelReader from "../components/excel/ExcelReader";

import { api } from "../services/api";
import { alerta } from '../utils/Notificaciones';
import "../styles/pages/Archivos.css";

// 🆕 1. Recibimos 'usuario' como prop desde App.jsx
export default function Archivos({ usuario }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, _setError] = useState("");
  const [modoSubida, setModoSubida] = useState(true);

  // 🆕 2. CARGAR LISTA DE ARCHIVOS (Solo los del usuario actual)
  const loadFiles = async () => {
    if (!usuario) return; // Seguridad
    try {
      // Pasamos el nombre del usuario a la API
      const data = await api.obtenerArchivos(usuario.nombre);
      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error("Error cargando archivos:", err);
      alerta.error("Error de conexión", "No se pudo cargar tu lista de archivos.");
    }
  };

  useEffect(() => { 
    loadFiles(); 
  }, [usuario]); // Se recarga si el usuario cambia

  // 🆕 3. FUNCIÓN PARA SUBIR ARCHIVO (A la carpeta del usuario)
  const handleUploadFile = async (fileObj) => {
    if (!fileObj || !usuario) return;
    
    const formData = new FormData();
    formData.append("file", fileObj);
    // 👈 Cambiamos "Usuario" por el nombre real del logueado
    formData.append("autor", usuario.nombre); 

    try {
      await api.subirArchivo(formData);
      loadFiles();
      alerta.success("Archivo subido correctamente");
    } catch (err) {
      alerta.error("Error al subir archivo", err.message);
    }
  };

  // 🆕 4. FUNCIÓN PARA ELIMINAR ARCHIVO (Solo de su carpeta)
  const handleDeleteFile = async (filename) => {
    try {
      // Pasamos el nombre del archivo Y el nombre del usuario
      await api.eliminarArchivo(filename, usuario.nombre);
      setFiles(prev => prev.filter(f => f.filename !== filename));
      if (selectedFile === filename) setSelectedFile(null);
      alerta.success("Archivo eliminado correctamente");
    } catch (err) {
      alerta.error(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div className="page-container">
      <h2 className="titulo_archivos">Gestión de Archivos</h2>
      <p style={{marginBottom: '20px', color: 'var(--text-muted)'}}>
        Carpeta personal de: <strong>{usuario?.nombre}</strong>
      </p>

      {/* Resto del JSX se mantiene igual... */}
      <div className="upload-section">
        {/* ... (Botones de modo subida/local) ... */}
        <div className="container_excelUploader">
          {modoSubida ? <ExcelUploader onUpload={handleUploadFile} /> : <ExcelReader />}
        </div>
      </div>

      {modoSubida && (
        <div className="files-layout">
          <div className="panel-section_1">
            <h3>Archivos en el Servidor</h3>
            <ExcelViewer
              files={files}
              onSelect={setSelectedFile}
              onDelete={handleDeleteFile}
            />
          </div>

          <div className="panel-section_2">
            <h3>Vista Previa (Servidor)</h3>
            {selectedFile ? (
              /* 🆕 5. Le pasamos el nombre del usuario para que pueda encontrar el archivo */
              <ExcelContent filename={selectedFile} autor={usuario.nombre} />
            ) : (
              <div className="container_reader_archivo">
                Selecciona un archivo de la lista izquierda para ver su contenido.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}