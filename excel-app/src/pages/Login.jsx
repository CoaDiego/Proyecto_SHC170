import { useState } from "react";
import { Link } from "react-router-dom"; 
import logoCarrera from "../assets/images/Logo-Adm.png";
import { alerta } from '../utils/Notificaciones';
import '../styles/components/ui/Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState(""); // 🆕 Ahora usamos email
  const [pass, setPass] = useState("");
  const [error, setError] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      /* const response = await fetch(`${import.meta.env.VITE_API_URL}/login_local`, { */
      const response = await fetch("http://127.0.0.1:8000/login_local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: pass }) // 🆕 Enviamos el email al backend
      });

      if (response.ok) {
        const perfil = await response.json();
        
        onLogin(perfil); 
        alerta.success("Acceso concedido", `Bienvenido, ${perfil.nombre}`);
      } else {
        alerta.error("Credenciales incorrectas", "Por favor, verifica tu correo y contraseña.");
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
          
          {/* 🆕 Actualizado a Correo Electrónico */}
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

          {error && (
            <div style={{ color: '#dc2626', fontSize: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>¿No tienes una cuenta? <Link to="/registro" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Regístrate aquí</Link></p>
        </div>

      </div>
    </div>
  );
}