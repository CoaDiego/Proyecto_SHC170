import { useState } from "react";
import { Link } from "react-router-dom"; // 🆕 Importamos Link para la navegación
import logoCarrera from "../assets/images/Logo-Adm.png";

import { alerta } from '../utils/Notificaciones';

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(""); 

  // 🆕 Convertimos la función a asíncrona para comunicarnos con FastAPI
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Hacemos la petición a la nueva ruta que creamos en el backend
     /*  const response = await fetch("http://localhost:8000/login_local", { */
     // CÁMBIALO POR ESTO:
// Reemplaza la URL manual por la variable de entorno
const response = await fetch(`${import.meta.env.VITE_API_URL}/login_local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario: user, password: pass })
});

      if (response.ok) {
        // Si el backend dice que todo está bien, recibimos el perfil
        const perfil = await response.json();
        
        onLogin(perfil); 
        alerta.success("Acceso concedido", `Bienvenido, ${perfil.nombre}`);
      } else {
        // Si la contraseña está mal o el usuario no existe
        alerta.error("Credenciales incorrectas", "Por favor, verifica tu usuario y contraseña.");
      }
    } catch (error) {
      alerta.error("Error de conexión", "Asegúrate de que el servidor Backend esté corriendo.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={logoCarrera}
            alt="Logo Administración de Empresas"
            style={{ width: '200px', height: 'auto' }}
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta">Usuario</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ingrese su usuario"
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta">Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </div>

          <button type="submit" style={{
            backgroundColor: 'var(--accent-color)',
            padding: '12px',
            fontSize: '1rem',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}>
            Ingresar
          </button>

          {error && (
            <div style={{
              color: '#dc2626',
              fontSize: '1rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </form>

        {/* 🆕 Enlace para ir a la pantalla de Registro */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>¿No tienes una cuenta? <Link to="/registro" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Regístrate aquí</Link></p>
        </div>

      </div>
    </div>
  );
}