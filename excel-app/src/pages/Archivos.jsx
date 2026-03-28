import { useState, useEffect } from "react";
import ExcelViewer from "../components/excel/ExcelViewer";
import ExcelUploader from "../components/excel/ExcelUploader";
import ExcelContent from "../components/excel/ExcelContent";
import ExcelReader from "../components/excel/ExcelReader";

import { api } from "../services/api";

import { alerta } from '../utils/Notificaciones';

import "../styles/pages/Archivos.css";

export default function Archivos() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, _setError] = useState("");

  const [modoSubida, setModoSubida] = useState(true);

  // 1. CARGAR LISTA DE ARCHIVOS
  const loadFiles = async () => {
    try {
      //const res = await fetch("http://127.0.0.1:8000/files");
      const data = await api.obtenerArchivos();
      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error("Error cargando archivos:", err);
      alerta.error("Error de conexión", "No se pudo conectar con el servidor para cargar los archivos.");
      //setError("No se pudo conectar con el servidor.");
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
      //const res = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
      await api.subirArchivo(formData);
      loadFiles();
      alerta.success("Archivo subido correctamente");
      /*if (res.ok) {
        loadFiles();
        alert("Archivo subido correctamente");
      } else {
        const errorData = await res.json();
        alert(`Error al subir: ${errorData.detail?.[0]?.msg || "Error desconocido"}`);
      }*/
    } catch (err) {
      alerta.error("Error al subir archivo", err.message);
    }
  };

  // 3. FUNCIÓN PARA ELIMINAR ARCHIVO
  const handleDeleteFile = async (filename) => {
    //if (!window.confirm(`¿Estás seguro de eliminar "${filename}"?`)) return;
    try {
      //const res = await fetch(`http://127.0.0.1:8000/files/${encodeURIComponent(filename)}`, { method: "DELETE" });
      await api.eliminarArchivo(filename);
      setFiles(prev => prev.filter(f => f.filename !== filename));
      if (selectedFile === filename) setSelectedFile(null);
      alerta.success("Archivo eliminado correctamente");
      /*if (res.ok) {
        setFiles(prev => prev.filter(f => f.filename !== filename));
        if (selectedFile === filename) setSelectedFile(null);
      } else {
        alert("No se pudo eliminar el archivo.");
      }*/
    } catch (err) {
      alerta.error(`Error al eliminar el archivo: ${err.message}`);
      console.error(err);
    }
  };

 return (
    <div className="page-container">
      <h2 className="titulo_archivos">Gestión de Archivos</h2>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>Error: {error}</p>}

      {/* SECCIÓN DE HERRAMIENTAS (Botones y Uploader/Reader) */}
      <div className="upload-section">
        <div className="upload-section_container">
          <button
            onClick={() => setModoSubida(true)}
            style={{
              fontWeight: modoSubida ? "bold" : "normal",
              opacity: modoSubida ? 1 : 0.6,
              borderBottom: modoSubida ? "3px solid var(--accent-color)" : "3px solid transparent"
            }}
            className="button_upload_1"
          >
          Subir al Servidor
          </button>

          <button
            onClick={() => setModoSubida(false)}
            style={{
              fontWeight: !modoSubida ? "bold" : "normal",
              opacity: !modoSubida ? 1 : 0.6,
              borderBottom: !modoSubida ? "3px solid var(--accent-color)" : "3px solid transparent"
            }}
            className="button_upload_2"
          >
          Solo Leer (Local)
          </button>
        </div>

        {/* Carga condicional de los componentes de subida/lectura */}
        <div className="container_excelUploader">
          {modoSubida ? <ExcelUploader onUpload={handleUploadFile} /> : <ExcelReader />}
        </div>
      </div>

      {/* ========================================================
          AQUÍ ESTÁ LA MAGIA:
          Solo mostramos la lista y la vista previa del servidor
          SI estamos en modo "Subir al Servidor" (modoSubida === true)
          ======================================================== */}
    {/* ========================================================
          ZONA INFERIOR: LISTA Y VISTA PREVIA (AHORA SÍ RESPONSIVA)
          ======================================================== */}
      {modoSubida && (
        <div 
          className="files-layout"
        >

          {/* COLUMNA IZQUIERDA: LISTA */}
          <div 
            className="panel-section_1" 
          >
            <h3>
              Archivos en el Servidor
            </h3>
            <ExcelViewer
              files={files}
              onSelect={setSelectedFile}
              onDelete={handleDeleteFile}
            />
          </div>

          {/* COLUMNA DERECHA: CONTENIDO */}
          <div 
            className="panel-section_2" 
          >
            <h3>
              Vista Previa (Servidor)
            </h3>
            {selectedFile ? (
              <ExcelContent filename={selectedFile} />
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