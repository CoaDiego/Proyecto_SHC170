import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../components/excel/DataContext";
import { alerta } from "../utils/Notificaciones";
import api from "../services/api";

export default function Grupos() {
  const { usuario } = useData();
  const navigate = useNavigate();

  // Estados vacíos (se llenarán desde la Base de Datos)
  const [misCursos, setMisCursos] = useState([]);
  const [cursosInscritos, setCursosInscritos] = useState([]);
  
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [fechaLimiteMatriculacion, setFechaLimiteMatriculacion] = useState("");
  const [hoveredCursoId, setHoveredCursoId] = useState(null);

  // Estados para la edición de cursos (Gestionar)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [cursoAEditar, setCursoAEditar] = useState(null);
  const [editarNombre, setEditarNombre] = useState("");
  const [editarFechaLimite, setEditarFechaLimite] = useState("");

  // Estados para la eliminación de cursos
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [cursoAEliminar, setCursoAEliminar] = useState(null);
  const [palabraConfirmar, setPalabraConfirmar] = useState("");

  // Extraemos el correo con seguridad
  const correoUsuario = usuario.email || usuario.id;

  if (!usuario) {
    navigate("/login");
    return null;
  }

  // 1. CARGAR DATOS DESDE MYSQL AL ABRIR LA PÁGINA
  const cargarCursos = async () => {
    try {
      if (["Docente", "Administrador"].includes(usuario.rol)) {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/mis_clases/${correoUsuario}`);
        if (res.ok) setMisCursos(await res.json());
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/mis_inscripciones/${correoUsuario}`);
        if (res.ok) setCursosInscritos(await res.json());
      }
    } catch (error) {
      console.error("Error cargando cursos:", error);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, [usuario]);

  // --- LÓGICA DEL DOCENTE: Crear curso en la BD ---
  const handleCrearCurso = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      alerta.error("Campos vacíos", "Por favor ingresa el nombre del curso.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/crear_clase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre: nuevoNombre, 
          docente_email: correoUsuario,
          fecha_limite_matriculacion: fechaLimiteMatriculacion || null
        }) 
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alerta.success("Curso creado", `El código para tus alumnos es: ${data.codigo_acceso}`);
        setNuevoNombre("");
        setFechaLimiteMatriculacion("");
        setMostrarModal(false);
        cargarCursos(); // Recargamos la lista desde la BD
      } else {
        alerta.error("Error", data.error || "No se pudo crear la clase.");
      }
    } catch (error) {
      alerta.error("Error de conexión", "No hay respuesta del servidor.");
    }
  };

  // --- LÓGICA DEL DOCENTE: Editar curso (Gestionar) ---
  const handleOpenEditar = (curso) => {
    setCursoAEditar(curso);
    setEditarNombre(curso.nombre);
    setEditarFechaLimite(curso.fecha_limite_matriculacion || "");
    setMostrarModalEditar(true);
  };

  const handleActualizarCurso = async (e) => {
    e.preventDefault();
    if (!editarNombre.trim()) {
      alerta.error("Campos vacíos", "Por favor ingresa el nombre del curso.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/actualizar_clase`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cursoAEditar.id,
          nombre: editarNombre,
          fecha_limite_matriculacion: editarFechaLimite || null
        })
      });

      const data = await res.json();

      if (res.ok) {
        alerta.success("Curso actualizado", "Los datos del curso han sido actualizados correctamente.");
        setMostrarModalEditar(false);
        setCursoAEditar(null);
        cargarCursos(); // Recargamos la lista desde la BD
      } else {
        alerta.error("Error", data.error || "No se pudo actualizar el curso.");
      }
    } catch (error) {
      alerta.error("Error de conexión", "No hay respuesta del servidor.");
    }
  };

  // --- LÓGICA DEL DOCENTE/ADMIN: Eliminar curso (Seguro) ---
  const handleOpenEliminar = (curso) => {
    setCursoAEliminar(curso);
    setPalabraConfirmar("");
    setMostrarModalEliminar(true);
  };

  const handleConfirmarEliminar = async (e) => {
    e.preventDefault();
    if (palabraConfirmar !== "ELIMINAR") {
      alerta.error("Confirmación incorrecta", "Debes escribir exactamente la palabra ELIMINAR.");
      return;
    }

    try {
      const res = await api.eliminarClase(cursoAEliminar.id, correoUsuario);
      alerta.success("Curso eliminado", res.message || "El curso ha sido eliminado permanentemente.");
      setMostrarModalEliminar(false);
      setCursoAEliminar(null);
      cargarCursos(); // Recargar la lista desde la BD
    } catch (error) {
      alerta.error("No se pudo eliminar", error.message || "Ocurrió un error al intentar eliminar el curso.");
    }
  };

  // --- LÓGICA DEL ESTUDIANTE: Unirse a curso en la BD ---
  const handleUnirseCurso = async () => {
    const codigoLimpiado = codigoBusqueda.trim().toUpperCase();

    if (!codigoLimpiado) {
      alerta.error("Campo vacío", "Ingresa el código de matriculación del curso.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/unirse_clase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo_acceso: codigoLimpiado, estudiante_email: correoUsuario })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alerta.success("¡Inscripción Exitosa!", data.message);
        setCodigoBusqueda(""); 
        cargarCursos(); // Recargamos la mochila del estudiante
      } else {
        alerta.error("No se pudo unir", data.error || "Asegúrate de escribir bien el código.");
      }
    } catch (error) {
      alerta.error("Error de conexión", "No hay respuesta del servidor.");
    }
  };
  
  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
      <div style={{ marginBottom: "30px", borderBottom: "2px solid var(--border-color)", paddingBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "var(--text-main)", margin: 0 }}>Gestión Académica y Cursos</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", margin: "5px 0 0 0" }}>
            Bienvenido, {usuario.nombre || usuario.nombres}
          </p>
        </div>
        <span style={{ backgroundColor: "var(--accent-color)", color: "white", padding: "5px 15px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.9rem" }}>
          Rol: {usuario.rol}
        </span>
      </div>

      {/* ========================================= */}
      {/* VISTA DEL DOCENTE / ADMINISTRADOR         */}
      {/* ========================================= */}
      {["Docente", "Administrador"].includes(usuario.rol) && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ color: "var(--primary-color)", margin: 0 }}>Cursos Disponibles (Global)</h2>
            <button
              onClick={() => setMostrarModal(true)}
              style={{ background: "var(--accent-color)", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", transition: "background 0.3s" }}
            >
              + Crear Nuevo Curso
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {misCursos.map((curso) => (
              <div key={curso.id} style={{ background: "var(--bg-card, white)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color, #eee)", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main, #333)" }}>{curso.nombre}</h3>
                <p style={{ margin: "0 0 5px 0", color: "var(--text-muted, #666)" }}>
                  <strong>Código de Matriculación:</strong> {curso.codigo}
                </p>
                {curso.fecha_limite_matriculacion && (
                  <p style={{ margin: "5px 0 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    <strong>Límite de Matrícula:</strong> {curso.fecha_limite_matriculacion}
                  </p>
                )}
                {usuario.rol === "Administrador" && (
                  <p style={{ margin: "5px 0 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    <strong>Docente:</strong> {curso.docente_nombre || "Desconocido"}
                  </p>
                )}
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button
                    onClick={() => handleOpenEditar(curso)}
                    onMouseEnter={() => setHoveredCursoId(curso.id)}
                    onMouseLeave={() => setHoveredCursoId(null)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: hoveredCursoId === curso.id ? "#374151" : "#4b5563",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      color: "#ffffff",
                      transition: "background-color 0.2s"
                    }}
                  >
                    Gestionar
                  </button>
                  <button
                    onClick={() => navigate("/archivos", { state: { cursoIdSeleccionado: curso.nombre } })}
                    style={{ flex: 1, padding: "8px", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Subir Material
                  </button>
                </div>
                <button
                  onClick={() => handleOpenEliminar(curso)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginTop: "10px",
                    background: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.3)",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#dc2626",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dc2626";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                >
                  🗑️ Eliminar Curso
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* VISTA DEL ESTUDIANTE                      */}
      {/* ========================================= */}
      {usuario.rol === "Estudiante" && (
        <div>
          <div style={{ background: "var(--bg-card, white)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color, #eee)", marginBottom: "30px" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "var(--text-main, #333)" }}>Matricularse a un Curso</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={codigoBusqueda}
                onChange={(e) => setCodigoBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnirseCurso()}
                placeholder="Ingresa el código proporcionado por tu docente (Ej: MAT-205)..."
                style={{ padding: "10px", flex: 1, borderRadius: "5px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", textTransform: "uppercase" }}
              />
              <button onClick={handleUnirseCurso} style={{ background: "#27ae60", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                Unirse al Curso
              </button>
            </div>
          </div>

          <h2 style={{ color: "#27ae60", marginBottom: "20px" }}>Mis Clases Activas</h2>

          {cursosInscritos.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", background: "var(--bg-main)", borderRadius: "8px", color: "var(--text-muted)" }}>
              Aún no estás inscrito en ninguna materia. Usa el buscador de arriba.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {cursosInscritos.map((curso) => (
                <div key={curso.id} style={{ background: "var(--bg-card, white)", padding: "20px", borderRadius: "8px", border: "1px solid var(--border-color, #eee)", borderTop: "4px solid #27ae60" }}>
                  <h3 style={{ margin: "0 0 10px 0", color: "var(--text-main, #333)" }}>{curso.nombre}</h3>
                  <p style={{ margin: "0 0 15px 0", color: "var(--text-muted, #666)" }}>
                    <strong>Código:</strong> {curso.codigo}
                  </p>
                  <button
                    onClick={() => navigate("/archivos", { state: { cursoIdSeleccionado: curso.nombre } })}
                    style={{ width: "100%", padding: "10px", background: "transparent", border: "1px solid #27ae60", color: "#27ae60", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", transition: "all 0.3s" }}
                  >
                    Ir a Material de Estudio
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================= */}
      {/* VENTANA MODAL PARA CREAR CURSO            */}
      {/* ========================================= */}
      {mostrarModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", border: "1px solid var(--border-color)" }}>
            <h2 style={{ marginTop: 0, color: "var(--primary-color)" }}>Crear Nuevo Curso</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
              El código de acceso se generará automáticamente de forma segura.
            </p>

            <form onSubmit={handleCrearCurso}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "var(--text-main)" }}>Nombre de la Materia:</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Estadística Empresarial I"
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid var(--border-color)", boxSizing: "border-box", background: "var(--bg-input)", color: "var(--text-main)" }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "var(--text-main)" }}>Fecha Límite de Matriculación (Opcional):</label>
                <input
                  type="date"
                  value={fechaLimiteMatriculacion}
                  onChange={(e) => setFechaLimiteMatriculacion(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid var(--border-color)", boxSizing: "border-box", background: "var(--bg-input)", color: "var(--text-main)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setMostrarModal(false)} style={{ padding: "10px 15px", background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: "10px 20px", background: "var(--accent-color)", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                  Generar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* VENTANA MODAL PARA EDITAR CURSO           */}
      {/* ========================================= */}
      {mostrarModalEditar && cursoAEditar && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", border: "1px solid var(--border-color)" }}>
            <h2 style={{ marginTop: 0, color: "var(--primary-color)" }}>Gestionar Curso</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>
              Código de acceso (Sólo lectura): <strong>{cursoAEditar.codigo}</strong>
            </p>

            <form onSubmit={handleActualizarCurso}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "var(--text-main)" }}>Nombre de la Materia:</label>
                <input
                  type="text"
                  value={editarNombre}
                  onChange={(e) => setEditarNombre(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid var(--border-color)", boxSizing: "border-box", background: "var(--bg-input)", color: "var(--text-main)" }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "var(--text-main)" }}>Fecha Límite de Matriculación (Opcional):</label>
                <input
                  type="date"
                  value={editarFechaLimite}
                  onChange={(e) => setEditarFechaLimite(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid var(--border-color)", boxSizing: "border-box", background: "var(--bg-input)", color: "var(--text-main)" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalEditar(false);
                    setCursoAEditar(null);
                  }}
                  style={{ padding: "10px 15px", background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Cancelar
                </button>
                <button type="submit" style={{ padding: "10px 20px", background: "var(--accent-color)", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* VENTANA MODAL PARA CONFIRMAR ELIMINACIÓN  */}
      {/* ========================================= */}
      {mostrarModalEliminar && cursoAEliminar && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}>
          <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
            <h2 style={{ marginTop: 0, color: "#dc2626" }}>⚠️ Eliminar Curso</h2>
            <p style={{ color: "var(--text-main)", fontSize: "0.95rem", marginBottom: "15px" }}>
              ¿Estás seguro de que deseas eliminar permanentemente el curso <strong>{cursoAEliminar.nombre}</strong>?
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "20px" }}>
              Esta acción borrará todas las inscripciones, archivos compartidos e historial de cálculos asociados a esta clase. Esta acción no se puede deshacer.
            </p>

            <form onSubmit={handleConfirmarEliminar}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "var(--text-main)", fontSize: "0.9rem" }}>
                  Escribe la palabra <strong>ELIMINAR</strong> en mayúsculas:
                </label>
                <input
                  type="text"
                  value={palabraConfirmar}
                  onChange={(e) => setPalabraConfirmar(e.target.value)}
                  placeholder="Escribe ELIMINAR"
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #dc2626", boxSizing: "border-box", background: "var(--bg-input)", color: "var(--text-main)" }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalEliminar(false);
                    setCursoAEliminar(null);
                  }}
                  style={{ padding: "10px 15px", background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}