import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alerta } from '../utils/Notificaciones'; // Asegúrate de que esta ruta sea correcta

export default function Perfil({ usuario, setUsuario }) {
  const navigate = useNavigate();
  
  // --- NUEVOS ESTADOS PARA EL MODO ADMINISTRADOR ---
  const [listaUsuarios, setListaUsuarios] = useState([]);

  useEffect(() => {
    // Solo si el usuario logueado es Administrador, descargamos la lista de la base de datos
    if (usuario && usuario.rol === "Administrador") {
      cargarUsuarios();
    }
  }, [usuario]);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/usuarios`);
      if (res.ok) {
        const data = await res.json();
        setListaUsuarios(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const cambiarRol = async (email, nuevoRol) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/cambiar_rol`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, nuevo_rol: nuevoRol })
      });
      
      if (res.ok) {
        alerta.success("Rol actualizado", `El usuario ha sido ascendido a ${nuevoRol}`);
        cargarUsuarios(); // Recargamos la tabla visualmente
      } else {
        alerta.error("Error", "No se pudo actualizar el rol");
      }
    } catch (error) {
      alerta.error("Error", "No hay conexión con el servidor");
    }
  };
  // ------------------------------------------------

  const handleCerrarSesion = () => {
    setUsuario(null); 
    navigate('/login'); 
  };

  if (!usuario) return null; 

  // Función UX para sacar las iniciales (ej: "Juan Pérez" -> "JP")
  const getIniciales = (nombre) => {
    if (!nombre) return '👤';
    const nombreLimpio = nombre.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
    const partes = nombreLimpio.split(/\s+/).filter(Boolean);
    
    if (partes.length > 1) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }
    return '👤';
  };

  return (
    // Ampliamos un poco el maxWidth a 800px para que la tabla de abajo quepa bien
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      
      {/* TARJETA DE PERFIL ORIGINAL (TU DISEÑO INTACTO) */}
      <div 
        className="grafico-card" 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
          backgroundColor: 'var(--bg-card)', 
          position: 'relative', 
          overflow: 'hidden' 
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '110px', backgroundColor: 'var(--accent-color)' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', position: 'relative', zIndex: 1, marginTop: '20px' }}>
            
            <div style={{ 
              width: '110px', height: '110px', borderRadius: '50%', backgroundColor: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', 
              fontWeight: 'bold', color: 'var(--accent-color)', border: '5px solid var(--bg-card)', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)', marginBottom: '15px' 
            }}>
              {getIniciales(usuario.nombre)}
            </div>
            
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 5px 0', color: 'var(--text-main)' }}>
              {usuario.nombre}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 20px 0' }}>
              {usuario.email || "usuario@correo.com"}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', color: '#d35400', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                 {usuario.perfil || usuario.rol || 'Estudiante Externo'}
              </span>
              
              {usuario.institucion && (
                <span style={{ backgroundColor: 'rgba(41, 128, 185, 0.1)', color: '#2980b9', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                   {usuario.institucion}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center', marginBottom: '30px' }}>
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '15px', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary-color)' }}>12</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Cálculos Guardados</p>
                </div>
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '15px', borderRadius: '8px', flex: 1, textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary-color)' }}>5</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Archivos Excel</p>
                </div>
            </div>

            <hr style={{ width: '100%', margin: '0 0 20px 0', borderColor: 'var(--border-color)', opacity: 0.3 }} />

            <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
              <button 
                onClick={() => navigate('/calculos')}
                style={{ flex: 1, backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Volver a la Calculadora
              </button>
              <button 
                onClick={handleCerrarSesion}
                style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cerrar Sesión
              </button>
            </div>

        </div>
      </div>

      {/* --- NUEVA TARJETA: PANEL DE ADMINISTRADOR (SOLO VISIBLE SI ES ADMIN) --- */}
      {usuario.rol === "Administrador" && (
        <div 
          className="grafico-card"
          style={{ 
            marginTop: '30px',
            borderRadius: '12px', 
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
            backgroundColor: 'var(--bg-card)', 
            padding: '30px'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', borderBottom: "2px solid var(--border-color)", paddingBottom: "10px" }}>
            ⚙️ Panel de Gestión de Roles
          </h3>
          <p style={{ fontSize: "0.9em", color: "var(--text-muted)", marginBottom: "20px" }}>
            Como administrador, puedes cambiar el rol de los usuarios para otorgarles permisos de Docente.
          </p>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "var(--bg-main)", borderRadius: "8px", overflow: "hidden" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--accent-color)", color: "white", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>Nombre</th>
                  <th style={{ padding: "12px" }}>Correo</th>
                  <th style={{ padding: "12px" }}>Rol Actual</th>
                  <th style={{ padding: "12px" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.map((u, index) => (
                  <tr key={u.email} style={{ borderBottom: "1px solid var(--border-color)", backgroundColor: index % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}>
                    <td style={{ padding: "12px", color: "var(--text-main)" }}>{u.nombre}</td>
                    <td style={{ padding: "12px", color: "var(--text-muted)" }}>{u.email}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ 
                        backgroundColor: u.rol === 'Administrador' ? '#ff4d4f' : (u.rol === 'Docente' ? '#52c41a' : '#1890ff'),
                        color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold'
                      }}>
                        {u.rol}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {u.rol !== "Administrador" ? (
                        <select 
                          value={u.rol} 
                          onChange={(e) => cambiarRol(u.email, e.target.value)}
                          style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid var(--border-color)", cursor: "pointer", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}
                        >
                          <option value="Estudiante">Estudiante</option>
                          <option value="Docente">Docente</option>
                        </select>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.9rem" }}>Protegido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}