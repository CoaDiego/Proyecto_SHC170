import { useState, useEffect } from "react";
import ExcelViewer from "../components/excel/ExcelViewer";
import ExcelUploader from "../components/excel/ExcelUploader";
import ExcelContent from "../components/excel/ExcelContent";

import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";
import "../styles/pages/Archivos.css";

import { useLocation } from "react-router-dom";

export default function Archivos({ usuario }) {
  // Estados para Archivos Personales
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // 🆕 ESTADO PARA LAS PESTAÑAS
  const [tabActiva, setTabActiva] = useState("personales"); // 'personales' o 'cursos'

  const location = useLocation();

  // EFECTO PARA DETECTAR SI VENIMOS DE LA PÁGINA DE GRUPOS
  useEffect(() => {
    if (location.state && location.state.cursoIdSeleccionado) {
      // Si recibimos un código, saltamos a la pestaña de cursos y lo seleccionamos
      setTabActiva("cursos");
      setCursoSeleccionado(location.state.cursoIdSeleccionado);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Estados para la lógica de Cursos
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  // (Mockup de cursos - esto luego vendrá del backend)
  const [misCursos, setMisCursos] = useState([]);

  useEffect(() => {
    if (!usuario) return;

    if (usuario.rol === "Estudiante") {
      // Si es estudiante, cargamos su mochila
      const inscritos = localStorage.getItem("cursos_estudiante");
      if (inscritos) setMisCursos(JSON.parse(inscritos));
    } else {
      // Si es docente/admin, cargamos los cursos creados
      const creados = localStorage.getItem("cursos_docente");
      if (creados) setMisCursos(JSON.parse(creados));
    }
  }, [usuario]);

  const loadFiles = async () => {
    if (!usuario) return;
    try {
      const esPestañaCursos = tabActiva === "cursos";
      const visibilidad = esPestañaCursos ? "privado" : "personal";

      // Para el estudiante, el "autor" de los archivos de curso es el servidor/docente
      // así que enviamos el cursoSeleccionado con prioridad.
      const data = await api.obtenerArchivos(
        usuario.nombre,
        visibilidad,
        cursoSeleccionado,
      );

      if (data.files) setFiles(data.files);
    } catch (err) {
      console.error("Error al cargar:", err);
    }
  };

  // 🚀 CRÍTICO: Este useEffect debe observar estos 3 cambios
  useEffect(() => {
    loadFiles();
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

    const confirmar = window.confirm(`¿Eliminar "${filename}" de forma permanente?`);
    if (!confirmar) return;

    try {
      await api.eliminarArchivo(filename, usuario.nombre);
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      if (selectedFile === filename) setSelectedFile(null);
      alerta.success("Archivo eliminado correctamente");
    } catch (err) {
      alerta.error("Error al eliminar", err.message || "No se pudo eliminar el archivo.");
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

            {/* AVISO VISUAL DE CURSO SELECCIONADO CON LÓGICA DE ROL */}
            {tabActiva === "cursos" && cursoSeleccionado && (
              <div
                style={{
                  backgroundColor: "#e8f4fd",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  borderLeft: "4px solid var(--primary-color)",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#0056b3" }}>
                  {" "}
                  {["Docente", "Administrador"].includes(usuario?.rol)
                    ? "Estás gestionando el material del curso:"
                    : "Viendo material de estudio del curso:"}{" "}
                  <strong>{cursoSeleccionado}</strong>
                </p>
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
                rol={usuario?.rol}
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
            minWidth: 0, /* 👈 El truco mágico que evita el desborde */
            display: "flex",
            flexDirection: "column",
            background: "var(--bg-card)",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            minHeight: "600px",
            maxHeight: "800px"
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
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
