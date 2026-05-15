import { useState, useEffect } from "react";
import ExcelViewer from "../components/excel/ExcelViewer";
import ExcelUploader from "../components/excel/ExcelUploader";
import ExcelContent from "../components/excel/ExcelContent";

import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";
import "../styles/pages/Archivos.css";

export default function Archivos({ usuario }) {
  // Estados para Archivos Personales
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // 🆕 ESTADO PARA LAS PESTAÑAS
  const [tabActiva, setTabActiva] = useState("personales"); // 'personales' o 'cursos'

  // Estados para la lógica de Cursos
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  // (Mockup de cursos - esto luego vendrá del backend)
  const misCursos = [
    { id: "EST-101", nombre: "Estadística Empresarial I" },
    { id: "DAT-205", nombre: "Análisis de Datos Avanzado" },
  ];

  const loadFiles = async () => {
    if (!usuario) return;
    try {
      // 🆕 Le decimos a la API qué pestaña estamos viendo
      const visibilidad = tabActiva === "cursos" ? "privado" : "personal";

      // Si estamos en la pestaña de cursos pero no hay curso seleccionado, limpiamos la lista
      if (tabActiva === "cursos" && !cursoSeleccionado) {
        setFiles([]);
        return;
      }

      // Pedimos los archivos específicos a la API
      const data = await api.obtenerArchivos(
        usuario.nombre,
        visibilidad,
        cursoSeleccionado,
      );
      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error("Error cargando archivos:", err);
      alerta.error("Error", "No se pudo cargar la lista de archivos.");
    }
  };

  // 🆕 Agregamos tabActiva y cursoSeleccionado a las dependencias para que se recargue solo
  useEffect(() => {
    loadFiles();
    setSelectedFile(null);
  }, [usuario, tabActiva, cursoSeleccionado]);

  const handleUploadFile = async (fileObj) => {
    if (!fileObj || !usuario) return;

    // Si estamos en la pestaña de Cursos, forzamos que el archivo vaya a ese curso
    if (tabActiva === "cursos" && !cursoSeleccionado) {
      alerta.error(
        "Faltan datos",
        "Selecciona el curso al que quieres subir el material.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", fileObj);
    formData.append("autor", usuario.nombre);

    // Etiquetamos el archivo según la pestaña en la que estemos
    formData.append(
      "visibilidad",
      tabActiva === "cursos" ? "privado" : "personal",
    );
    if (tabActiva === "cursos") formData.append("curso", cursoSeleccionado);

    try {
      await api.subirArchivo(formData);
      loadFiles();
      alerta.success("¡Archivo Subido!");
    } catch (err) {
      alerta.error("Error al subir archivo", err.message);
    }
  };

  const handleDeleteFile = async (filename) => {
    // Evitamos que los estudiantes borren archivos de la pestaña de cursos
    if (tabActiva === "cursos" && usuario.rol === "Estudiante") {
      alerta.error(
        "Acceso Denegado",
        "No puedes eliminar el material subido por el docente.",
      );
      return;
    }

    try {
      await api.eliminarArchivo(filename, usuario.nombre);
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      if (selectedFile === filename) setSelectedFile(null);
      alerta.success("Archivo eliminado");
    } catch (err) {
      alerta.error(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div
      className="page-container"
      style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}
    >
      <div
        style={{
          borderBottom: "2px solid var(--border-color)",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: "var(--text-main)" }}>
          Gestión de Datos y Archivos
        </h2>
        <p style={{ margin: "5px 0 0 0", color: "var(--text-muted)" }}>
          Espacio de trabajo de: <strong>{usuario?.nombre}</strong> (
          {usuario?.rol})
        </p>
      </div>

      <div
        className="files-layout"
        style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}
      >
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: Pestañas y Gestión (35%)               */}
        {/* ========================================================= */}
        <div
          style={{
            flex: "0 0 35%",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          {/* 🆕 SELECTOR DE PESTAÑAS */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-card)",
              borderRadius: "8px",
              padding: "5px",
              border: "1px solid var(--border-color)",
            }}
          >
            <button
              onClick={() => setTabActiva("personales")}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                background:
                  tabActiva === "personales"
                    ? "var(--accent-color)"
                    : "transparent",
                color:
                  tabActiva === "personales" ? "white" : "var(--text-muted)",
              }}
            >
              👤 Mi Espacio
            </button>
            <button
              onClick={() => setTabActiva("cursos")}
              style={{
                flex: 1,
                padding: "10px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                background:
                  tabActiva === "cursos"
                    ? "var(--primary-color)"
                    : "transparent",
                color: tabActiva === "cursos" ? "white" : "var(--text-muted)",
              }}
            >
              📚 Mis Cursos
            </button>
          </div>

          {/* CONTENIDO SEGÚN LA PESTAÑA */}
          <div
            style={{
              background: "var(--bg-card)",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            {tabActiva === "cursos" && (
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Selecciona un Curso:
                </label>
                <select
                  value={cursoSeleccionado}
                  onChange={(e) => setCursoSeleccionado(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <option value="">
                    -- Elige un curso para ver material --
                  </option>
                  {misCursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subida de archivos: Oculta para estudiantes en la pestaña de cursos */}
            {!(tabActiva === "cursos" && usuario?.rol === "Estudiante") && (
              <div
                style={{
                  marginBottom: "20px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>
                  {tabActiva === "cursos"
                    ? "Subir Material al Curso"
                    : "Subir Archivo Personal"}
                </h3>
                <ExcelUploader onUpload={handleUploadFile} />
              </div>
            )}

            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem" }}>
              {tabActiva === "cursos" ? "Material Compartido" : "Mis Archivos"}
            </h3>

            {/* Si es curso y no ha seleccionado uno, no mostramos la lista */}
            {tabActiva === "cursos" && !cursoSeleccionado ? (
              <p
                style={{
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  textAlign: "center",
                }}
              >
                Selecciona un curso arriba para ver sus archivos.
              </p>
            ) : (
              <ExcelViewer
                files={files}
                onSelect={setSelectedFile}
                onDelete={handleDeleteFile}
              />
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: Vista Previa                            */}
        {/* ========================================================= */}
        <div
          style={{
            flex: "1",
            background: "var(--bg-card)",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            minHeight: "600px",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "1.2rem",
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "10px",
            }}
          >
            Vista Previa de Datos
          </h3>
          {selectedFile ? (
            <div style={{ height: "100%", overflow: "auto" }}>
              <ExcelContent
                filename={selectedFile}
                autor={usuario.nombre}
                curso={tabActiva === "cursos" ? cursoSeleccionado : ""}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                height: "80%",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontStyle: "italic",
                backgroundColor: "var(--bg-main)",
                borderRadius: "8px",
                border: "1px dashed #ccc",
              }}
            >
              Selecciona un archivo de la lista para visualizarlo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
