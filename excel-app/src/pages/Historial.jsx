import React, { useEffect, useState } from "react";
import { useData } from "../components/excel/DataContext";
import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";

import { useNavigate } from "react-router-dom";

export default function Historial() {
  const { usuario } = useData();
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = async () => {
    if (!usuario) return;
    try {
      const data = await api.obtenerHistorial(usuario.nombre);
      setRegistros(data.historial || []);
    } catch (error) {
      alerta.error("Error", "No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await api.eliminarHistorial(id, usuario.nombre);
      // Filtramos el registro eliminado de la pantalla al instante
      setRegistros(registros.filter((reg) => reg.id !== id));
      alerta.exito("Eliminado", "El registro ha sido borrado de tu historial.");
    } catch (error) {
      alerta.error("Error", "No se pudo eliminar el registro.");
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [usuario]);

  return (
    <div className="page-container" style={{ padding: "30px" }}>
      <h2
        style={{
          color: "var(--text-main)",
          borderBottom: "2px solid var(--accent-color)",
          paddingBottom: "10px",
        }}
      >
         Historial de Cálculos
      </h2>
      <p style={{ color: "var(--text-muted)" }}>
        Bienvenido, {usuario?.nombre}. Aquí puedes revisar tus análisis previos.
      </p>

      {cargando ? (
        <p>Cargando registros...</p>
      ) : registros.length === 0 ? (
        <div className="container_reader_archivo">
          <p>No tienes cálculos guardados todavía.</p>
        </div>
      ) : (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "var(--bg-card)",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
          }}
        >
          <table
            className="tabla-academica"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <tr>
                <th style={{ padding: "15px" }}>Fecha / Hora</th>
                <th>Tipo de Cálculo</th>
                <th>Archivo Fuente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg) => (
                <tr
                  key={reg.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <strong>{reg.fecha}</strong> <br />
                    <small style={{ color: "var(--text-muted)" }}>
                      {reg.hora}
                    </small>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "var(--accent-color)",
                    }}
                  >
                    {reg.calculo.replace(/_/g, " ").toUpperCase()}
                  </td>
                  <td style={{ textAlign: "center" }}>{reg.archivo_origen}</td>

                  {/* ZONA DE BOTONES ACTUALIZADA */}
                  <td
                    style={{
                      textAlign: "center",
                      display: "flex",
                      gap: "10px",
                      justifyContent: "center",
                      padding: "10px",
                    }}
                  >
                    <button
                      style={{
                        background: "none",
                        border: "1px solid var(--primary-color)",
                        color: "var(--primary-color)",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        navigate("/calculadora", {
                          state: {
                            archivoReabrir: reg.archivo_origen,
                            calculoReabrir: reg.calculo,
                            colXReabrir: reg.columna_x, // 🆕 Mandamos X
                            colYReabrir: reg.columna_y, // 🆕 Mandamos Y
                            hojaReabrir: reg.hoja
                          },
                        });
                      }}
                      title="Cargar este cálculo"
                    >
                      Reabrir
                    </button>

                    <button
                      style={{
                        background: "none",
                        border: "1px solid #d9534f",
                        color: "#d9534f",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleEliminar(reg.id)}
                      title="Eliminar registro"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
