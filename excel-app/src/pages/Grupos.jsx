import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../components/excel/DataContext";
import { alerta } from "../utils/Notificaciones";

export default function Grupos() {
  const { usuario } = useData();
  const navigate = useNavigate();

  // Estados vacíos (se llenarán desde la Base de Datos)
  const [misCursos, setMisCursos] = useState([]);
  const [cursosInscritos, setCursosInscritos] = useState([]);
  
  const [codigoBusqueda, setCodigoBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");

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
        // Enviamos el correo explícitamente
        body: JSON.stringify({ nombre: nuevoNombre, docente_email: correoUsuario }) 
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alerta.success("Curso creado", `El código para tus alumnos es: ${data.codigo_acceso}`);
        setNuevoNombre("");
        setMostrarModal(false);
        cargarCursos(); // Recargamos la lista desde la BD
      } else {
        alerta.error("Error", data.error || "No se pudo crear la clase.");
      }
    } catch (error) {
      alerta.error("Error de conexión", "No hay respuesta del servidor.");
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
        // Enviamos el correo explícitamente
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
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button style={{ flex: 1, padding: "8px", background: "var(--bg-main, #f4f4f4)", border: "1px solid var(--border-color, #ccc)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", color: "var(--text-main)" }}>
                    Gestionar
                  </button>
                  <button
                    onClick={() => navigate("/archivos", { state: { cursoIdSeleccionado: curso.codigo } })}
                    style={{ flex: 1, padding: "8px", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                  >
                    Subir Material
                  </button>
                </div>
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
                    onClick={() => navigate("/archivos", { state: { cursoIdSeleccionado: curso.codigo } })}
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
              <div style={{ marginBottom: "25px" }}>
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
    </div>
  );
}