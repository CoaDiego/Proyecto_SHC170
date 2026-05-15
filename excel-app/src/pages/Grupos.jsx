import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../components/excel/DataContext";
import { alerta } from "../utils/Notificaciones";

import { useLocation } from "react-router-dom";

export default function Grupos() {
  const { usuario } = useData();
  const navigate = useNavigate();

  // 1. CARGAMOS LOS CURSOS DESDE LA MEMORIA DEL NAVEGADOR
  const [misCursos, setMisCursos] = useState(() => {
    const cursosGuardados = localStorage.getItem("cursos_docente");
    return cursosGuardados
      ? JSON.parse(cursosGuardados)
      : [
          {
            id: "EST-101",
            nombre: "Estadística Empresarial I",
            codigo: "EST-101",
            alumnos: 24,
            archivos: 3,
          },
          {
            id: "DAT-205",
            nombre: "Análisis de Datos Avanzado",
            codigo: "DAT-205",
            alumnos: 15,
            archivos: 5,
          },
        ];
  });

  // 2. GUARDAMOS AUTOMÁTICAMENTE CADA VEZ QUE SE CREE UN CURSO NUEVO
  React.useEffect(() => {
    localStorage.setItem("cursos_docente", JSON.stringify(misCursos));
  }, [misCursos]);

  // 1. LA MOCHILA DEL ESTUDIANTE (Ahora con memoria localStorage)
  const [cursosInscritos, setCursosInscritos] = useState(() => {
    const guardados = localStorage.getItem("cursos_estudiante");
    return guardados
      ? JSON.parse(guardados)
      : [
          {
            id: "EST-101",
            nombre: "Estadística Empresarial I",
            codigo: "EST-101",
          },
        ];
  });

  // Guardamos en memoria cada vez que el estudiante se inscribe a uno nuevo
  React.useEffect(() => {
    localStorage.setItem("cursos_estudiante", JSON.stringify(cursosInscritos));
  }, [cursosInscritos]);

  // Estado para el buscador del estudiante
  const [codigoBusqueda, setCodigoBusqueda] = useState("");

  // Estados para la ventana modal del docente
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCodigo, setNuevoCodigo] = useState("");

  if (!usuario) {
    navigate("/login");
    return null;
  }

  // --- LÓGICA DEL DOCENTE: Crear curso ---
  const handleCrearCurso = (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoCodigo.trim()) {
      alerta.error(
        "Campos vacíos",
        "Por favor ingresa el nombre y la sigla del curso.",
      );
      return;
    }

    const codigoMayusculas = nuevoCodigo.trim().toUpperCase();
    if (misCursos.some((c) => c.codigo === codigoMayusculas)) {
      alerta.error("Código duplicado", "Ya existe un curso con esa sigla.");
      return;
    }

    const nuevoCurso = {
      id: codigoMayusculas,
      nombre: nuevoNombre,
      codigo: codigoMayusculas,
      alumnos: 0,
      archivos: 0,
    };

    setMisCursos([...misCursos, nuevoCurso]);
    setNuevoNombre("");
    setNuevoCodigo("");
    setMostrarModal(false);
    alerta.success("Curso creado", `El curso ${codigoMayusculas} está listo.`);
  };

  // --- LÓGICA DEL ESTUDIANTE: Unirse a curso ---
  const handleUnirseCurso = () => {
    const codigoLimpiado = codigoBusqueda.trim().toUpperCase();

    if (!codigoLimpiado) {
      alerta.error(
        "Campo vacío",
        "Ingresa el código de matriculación del curso.",
      );
      return;
    }

    // 1. Buscamos si el curso existe en la base de datos global
    const cursoEncontrado = misCursos.find((c) => c.codigo === codigoLimpiado);

    if (!cursoEncontrado) {
      alerta.error(
        "Curso no encontrado",
        "Asegúrate de haber escrito bien el código. (Ej: EST-101)",
      );
      return;
    }

    // 2. Verificamos si el estudiante ya está inscrito
    const yaEstaInscrito = cursosInscritos.find(
      (c) => c.codigo === codigoLimpiado,
    );

    if (yaEstaInscrito) {
      alerta.warning("Aviso", "Ya estás inscrito en este curso.");
      return;
    }

    // 3. Lo matriculamos (lo agregamos a su lista)
    setCursosInscritos([...cursosInscritos, cursoEncontrado]);
    setCodigoBusqueda(""); // Limpiamos el buscador
    alerta.success(
      "¡Inscripción Exitosa!",
      `Te has unido a: ${cursoEncontrado.nombre}`,
    );
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div
        style={{
          marginBottom: "30px",
          borderBottom: "2px solid var(--border-color)",
          paddingBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "var(--text-main)", margin: 0 }}>
            Gestión Académica y Cursos
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              margin: "5px 0 0 0",
            }}
          >
            Bienvenido, {usuario.nombres}
          </p>
        </div>
        <span
          style={{
            backgroundColor: "var(--accent-color)",
            color: "white",
            padding: "5px 15px",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "0.9rem",
          }}
        >
          Rol: {usuario.rol}
        </span>
      </div>

      {/* ========================================= */}
      {/* VISTA DEL DOCENTE / ADMINISTRADOR         */}
      {/* ========================================= */}
      {["Docente", "Administrador"].includes(usuario.rol) && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ color: "var(--primary-color)", margin: 0 }}>
              Cursos Disponibles (Global)
            </h2>
            <button
              onClick={() => setMostrarModal(true)}
              style={{
                background: "var(--accent-color)",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
                transition: "background 0.3s",
              }}
            >
              + Crear Nuevo Curso
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {/* El docente ve la lista global: misCursos */}
            {misCursos.map((curso) => (
              <div
                key={curso.id}
                style={{
                  background: "var(--bg-card, white)",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color, #eee)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px 0",
                    color: "var(--text-main, #333)",
                  }}
                >
                  {curso.nombre}
                </h3>
                <p
                  style={{
                    margin: "0 0 5px 0",
                    color: "var(--text-muted, #666)",
                  }}
                >
                  <strong>Código de Matriculación:</strong> {curso.codigo}
                </p>
                <p
                  style={{
                    margin: "0 0 15px 0",
                    color: "var(--text-muted, #666)",
                  }}
                >
                  👥 {curso.alumnos} Estudiantes | 📁 {curso.archivos} Archivos
                </p>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "var(--bg-main, #f4f4f4)",
                      border: "1px solid var(--border-color, #ccc)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Gestionar
                  </button>
                  <button
                    onClick={() =>
                      navigate("/archivos", {
                        state: { cursoIdSeleccionado: curso.codigo },
                      })
                    }
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "var(--primary-color)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
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
          {/* Panel de Matriculación */}
          <div
            style={{
              background: "var(--bg-card, white)",
              padding: "20px",
              borderRadius: "8px",
              border: "1px solid var(--border-color, #eee)",
              marginBottom: "30px",
            }}
          >
            <h3
              style={{ margin: "0 0 15px 0", color: "var(--text-main, #333)" }}
            >
              Matricularse a un Curso
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={codigoBusqueda}
                onChange={(e) => setCodigoBusqueda(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnirseCurso()}
                placeholder="Ingresa el código proporcionado por tu docente (Ej: DAT-205)..."
                style={{
                  padding: "10px",
                  flex: 1,
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  textTransform: "uppercase",
                }}
              />
              <button
                onClick={handleUnirseCurso}
                style={{
                  background: "#27ae60",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Unirse al Curso
              </button>
            </div>
          </div>

          <h2 style={{ color: "#27ae60", marginBottom: "20px" }}>
            Mis Clases Activas
          </h2>

          {cursosInscritos.length === 0 ? (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                background: "#f9f9f9",
                borderRadius: "8px",
                color: "#888",
              }}
            >
              Aún no estás inscrito en ninguna materia. Usa el buscador de
              arriba.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {/* 🚀 EL ESTUDIANTE SOLO VE SU MOCHILA: cursosInscritos */}
              {cursosInscritos.map((curso) => (
                <div
                  key={curso.id}
                  style={{
                    background: "var(--bg-card, white)",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #eee)",
                    borderTop: "4px solid #27ae60",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 10px 0",
                      color: "var(--text-main, #333)",
                    }}
                  >
                    {curso.nombre}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 15px 0",
                      color: "var(--text-muted, #666)",
                    }}
                  >
                    <strong>Código:</strong> {curso.codigo}
                  </p>
                  <button
                    onClick={() =>
                      navigate("/archivos", {
                        state: { cursoIdSeleccionado: curso.codigo },
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "white",
                      border: "1px solid #27ae60",
                      color: "#27ae60",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      transition: "all 0.3s",
                    }}
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
      {/* VENTANA MODAL (FLOTANTE) PARA CREAR CURSO */}
      {/* ========================================= */}
      {mostrarModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              width: "400px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "var(--primary-color)" }}>
              Crear Nuevo Curso
            </h2>
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              Configura el espacio de trabajo para tus estudiantes.
            </p>

            <form onSubmit={handleCrearCurso}>
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Nombre de la Materia:
                </label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Administración Financiera"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                  }}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Sigla / Código de Matriculación:
                </label>
                <input
                  type="text"
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej. ADM-300"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                    textTransform: "uppercase",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  style={{
                    padding: "10px 15px",
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    background: "var(--accent-color)",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Guardar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
