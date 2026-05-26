import { useState } from "react";
import { Link } from "react-router-dom"; 
import logoCarrera from "../assets/images/Logo-Adm.png";
import { api } from "../services/api";
import { alerta } from '../utils/Notificaciones';
import '../styles/components/ui/Login.css';

// 🆕 Importamos tu componente original (Ajusta la ruta si tu carpeta se llama distinto)
import OscuroClaro from "../components/ui/oscuro_claro.jsx";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState(""); 
  const [pass, setPass] = useState("");
  const [error, setError] = useState(""); 

  // Estados para recuperación de contraseña
  const [vista, setVista] = useState("login"); // login | forgot | reset
  const [token, setToken] = useState("");
  const [nuevoPass, setNuevoPass] = useState("");
  const [confirmarNuevoPass, setConfirmarNuevoPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const perfil = await api.loginLocal(email, pass);
      onLogin(perfil); 
      alerta.success("Acceso concedido", `Bienvenido, ${perfil.nombre}`);
    } catch (error) {
      if (error.message === "Credenciales incorrectas") {
        alerta.error("Credenciales incorrectas", "Por favor, verifica tu correo y contraseña.");
      } else {
        alerta.error("Error de conexión", "Asegúrate de que el servidor Backend esté corriendo.");
      }
    }
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    if (!email) {
      alerta.error("Campo vacío", "Por favor, introduce tu correo electrónico.");
      return;
    }
    try {
      const res = await api.recuperarPassword(email);
      alerta.success("Código de recuperación generado", `Para pruebas locales, introduce el código: ${res.token}`);
      setVista("reset");
    } catch (err) {
      alerta.error("Error", err.message || "Error al solicitar el código de recuperación.");
    }
  };

  const handleResetear = async (e) => {
    e.preventDefault();
    if (!token || !nuevoPass || !confirmarNuevoPass) {
      alerta.error("Campos vacíos", "Por favor, completa todos los campos.");
      return;
    }
    if (nuevoPass !== confirmarNuevoPass) {
      alerta.error("Error", "Las contraseñas no coinciden.");
      return;
    }
    try {
      await api.resetearPassword(email, token, nuevoPass);
      alerta.success("Contraseña restablecida", "Tu contraseña ha sido cambiada. Inicia sesión con tus nuevas credenciales.");
      setPass("");
      setVista("login");
    } catch (err) {
      alerta.error("Error", err.message || "El token es inválido o ha expirado.");
    }
  };

  return (
    <div className="login-container" style={{ position: 'relative' }}>
      
      {/* 🆕 Aquí insertamos tu botón oficial en la esquina superior izquierda */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}>
        <OscuroClaro />
      </div>

      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={logoCarrera}
            alt="Logo Administración de Empresas"
            style={{ width: '200px', height: 'auto' }}
          />
        </div>

        {vista === "login" && (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'left' }}>
                <label className="etiqueta">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label className="etiqueta">Contraseña</label>
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  required
                />
              </div>

              <button type="submit" style={{
                backgroundColor: 'var(--accent-color)',
                padding: '12px',
                fontSize: '1rem',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}>
                Ingresar
              </button>
            </form>

            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
              <button 
                onClick={() => setVista("forgot")} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
              <p>¿No tienes una cuenta? <Link to="/registro" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Regístrate aquí</Link></p>
            </div>
          </>
        )}

        {vista === "forgot" && (
          <>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '15px' }}>Recuperación de Contraseña</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              Introduce tu correo electrónico para obtener un código de reseteo.
            </p>
            <form onSubmit={handleRecuperar} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'left' }}>
                <label className="etiqueta">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <button type="submit" style={{
                backgroundColor: 'var(--accent-color)',
                padding: '12px',
                fontSize: '1rem',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}>
                Obtener Código
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
              <button 
                onClick={() => setVista("login")} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </>
        )}

        {vista === "reset" && (
          <>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '15px' }}>Restablecer Contraseña</h3>
            <form onSubmit={handleResetear} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <label className="etiqueta">Código de Recuperación</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Introduce el código de 6 dígitos"
                  required
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label className="etiqueta">Nueva Contraseña</label>
                <input
                  type="password"
                  value={nuevoPass}
                  onChange={(e) => setNuevoPass(e.target.value)}
                  placeholder="Nueva contraseña"
                  required
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label className="etiqueta">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={confirmarNuevoPass}
                  onChange={(e) => setConfirmarNuevoPass(e.target.value)}
                  placeholder="Confirma la contraseña"
                  required
                />
              </div>

              <button type="submit" style={{
                backgroundColor: 'var(--accent-color)',
                padding: '12px',
                fontSize: '1rem',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '5px',
                fontWeight: 'bold',
                marginTop: '10px'
              }}>
                Cambiar Contraseña
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
              <button 
                onClick={() => setVista("login")} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cancelar y volver
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}