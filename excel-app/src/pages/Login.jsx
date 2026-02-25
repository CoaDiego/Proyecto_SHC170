import { useState } from "react";
import logoCarrera from "../assets/images/escudoAdmin.png";

import { alerta} from '../utils/Notificaciones';

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, _setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "123") {
      onLogin(true);
    } else {
      alerta.error("Credenciales incorrectas", "Por favor, ingresa tus credenciales correctas.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={logoCarrera}
            alt="Logo Administración de Empresas"
            style={{ width: '180px', height: 'auto' }}
          />
          <h4 style={{ color: "white", marginBottom: '20px' }}>ADMINISTRACIÓN DE EMPRESAS</h4>
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
            fontSize: '1rem'
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
      </div>
    </div>
  );
}