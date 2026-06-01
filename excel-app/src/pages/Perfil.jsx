import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alerta } from '../utils/Notificaciones';
import { api } from "../services/api";

export default function Perfil({ usuario, setUsuario }) {
  const navigate = useNavigate();
  
  // --- ESTADOS PARA GESTIÓN DE ROLES (ADMIN) ---
  const [listaUsuarios, setListaUsuarios] = useState([]);

  // --- ESTADOS PARA CAMBIAR CONTRASEÑA ---
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passNuevaConf, setPassNuevaConf] = useState("");

  // --- ESTADOS PARA ELIMINAR CUENTA ---
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState(false);
  const [passEliminar, setPassEliminar] = useState("");
  const [palabraConfirmacion, setPalabraConfirmacion] = useState("");

  useEffect(() => {
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
        cargarUsuarios();
      } else {
        alerta.error("Error", "No se pudo actualizar el rol");
      }
    } catch (error) {
      alerta.error("Error", "No hay conexión con el servidor");
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    setUsuario(null); 
    navigate('/login'); 
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (!passActual || !passNueva || !passNuevaConf) {
      alerta.error("Campos vacíos", "Por favor, completa todos los campos.");
      return;
    }
    if (passNueva !== passNuevaConf) {
      alerta.error("Error", "Las nuevas contraseñas no coinciden.");
      return;
    }
    try {
      await api.cambiarPasswordPerfil(usuario.email, passActual, passNueva);
      alerta.success("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente.");
      setPassActual("");
      setPassNueva("");
      setPassNuevaConf("");
    } catch (err) {
      alerta.error("Error", err.message || "La contraseña actual es incorrecta.");
    }
  };

  const handleEliminarCuenta = async (e) => {
    e.preventDefault();
    if (palabraConfirmacion !== "ELIMINAR") {
      alerta.error("Confirmación incorrecta", "Debes escribir la palabra 'ELIMINAR' en mayúsculas.");
      return;
    }
    if (!passEliminar) {
      alerta.error("Contraseña requerida", "Por favor, ingresa tu contraseña para confirmar.");
      return;
    }
    try {
      await api.eliminarCuenta(usuario.email, passEliminar);
      alerta.success("Cuenta eliminada", "Tu cuenta ha sido eliminada permanentemente.");
      localStorage.removeItem("token");
      setUsuario(null);
      navigate("/login");
    } catch (err) {
      alerta.error("Error", err.message || "La contraseña ingresada es incorrecta.");
    }
  };

  if (!usuario) return null; 

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
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      
      {/* TARJETA DE PERFIL */}
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

      {/* SECCIÓN DE SEGURIDAD Y CONFIGURACIÓN */}
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
        <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', borderBottom: "2px solid var(--border-color)", paddingBottom: "10px" }}>
          🔒 Seguridad y Contraseña
        </h3>
        
        <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta" style={{ color: 'var(--text-main)' }}>Contraseña Actual</label>
            <input 
              type="password" 
              value={passActual} 
              onChange={(e) => setPassActual(e.target.value)} 
              placeholder="Contraseña actual" 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} 
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'left', flex: 1, minWidth: '200px' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>Nueva Contraseña</label>
              <input 
                type="password" 
                value={passNueva} 
                onChange={(e) => setPassNueva(e.target.value)} 
                placeholder="Nueva contraseña" 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                required
              />
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: '200px' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                value={passNuevaConf} 
                onChange={(e) => setPassNuevaConf(e.target.value)} 
                placeholder="Repite nueva contraseña" 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} 
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            style={{ 
              alignSelf: 'flex-start',
              backgroundColor: 'var(--accent-color)', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>

      {/* SECCIÓN DE DARSE DE BAJA */}
      <div 
        className="grafico-card"
        style={{ 
          marginTop: '30px',
          borderRadius: '12px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
          backgroundColor: 'var(--bg-card)', 
          padding: '30px',
          border: '1px solid rgba(220, 38, 38, 0.3)'
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', borderBottom: "2px solid rgba(220, 38, 38, 0.2)", paddingBottom: "10px" }}>
          ⚠️ Zona de Peligro: Darse de Baja
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Al darse de baja, se eliminará tu cuenta y todos tus datos (archivos guardados, historial de cálculos, clases) de forma permanente del sistema. Esta acción no se puede deshacer.
        </p>

        {!mostrarConfirmarEliminar ? (
          <button 
            onClick={() => setMostrarConfirmarEliminar(true)}
            style={{ 
              backgroundColor: '#dc2626', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold' 
            }}
          >
            Eliminar Cuenta
          </button>
        ) : (
          <form onSubmit={handleEliminarCuenta} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: 'rgba(220, 38, 38, 0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#dc2626', fontSize: '0.9rem' }}>
              Confirmación de Seguridad requerida:
            </p>
            
            <div style={{ textAlign: 'left' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>
                Escribe la palabra <strong>ELIMINAR</strong> en mayúsculas:
              </label>
              <input 
                type="text" 
                value={palabraConfirmacion} 
                onChange={(e) => setPalabraConfirmacion(e.target.value)} 
                placeholder="Escribe ELIMINAR" 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dc2626', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '5px', boxSizing: 'border-box' }} 
                required
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>
                Confirma ingresando tu contraseña actual:
              </label>
              <input 
                type="password" 
                value={passEliminar} 
                onChange={(e) => setPassEliminar(e.target.value)} 
                placeholder="Tu contraseña" 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '5px', boxSizing: 'border-box' }} 
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="submit"
                style={{ 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                Confirmar Borrado de Cuenta
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setMostrarConfirmarEliminar(false);
                  setPalabraConfirmacion("");
                  setPassEliminar("");
                }}
                style={{ 
                  backgroundColor: 'var(--bg-main)', 
                  color: 'var(--text-main)', 
                  border: '1px solid var(--border-color)', 
                  padding: '10px 20px', 
                  borderRadius: '4px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* --- PANEL DE ADMINISTRADOR (SOLO VISIBLE SI ES ADMIN) --- */}
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