import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoCarrera from "../assets/images/Logo-Adm.png";
import { alerta } from '../utils/Notificaciones';

export default function Registro() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pass !== confirmPass) {
      alerta.error("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (nombres && apellidos && email && pass) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/registrar_usuario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            nombres: nombres, 
            apellidos: apellidos,
            email: email,             
            password: pass 
          })
        });

        if (response.ok) {
          alerta.success("Cuenta creada", "Tu cuenta ha sido registrada exitosamente.");
          navigate("/login"); 
        } else {
          const errorData = await response.json();
          alerta.error("Error", errorData.error || "No se pudo registrar.");
        }
      } catch (error) {
        alerta.error("Error de conexión", "Asegúrate de que el servidor Backend esté corriendo.");
      }
    } else {
      alerta.error("Datos incompletos", "Por favor, llena todos los campos del formulario.");
    }
  };

  return (
    <div className="login-container" style={{ padding: '20px' }}>
      <div className="login-card" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={logoCarrera} alt="Logo" style={{ width: '150px', height: 'auto' }} />
          <h3 style={{ marginTop: '15px', color: '#333' }}>Registro de Usuario</h3>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Crea tu cuenta para acceder al sistema.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Nombres</label>
              <input type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Ej. Juan Carlos" style={{ width: '100%' }} />
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Apellidos</label>
              <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} placeholder="Ej. Pérez Gómez" style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta">Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Contraseña</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Crea una contraseña" style={{ width: '100%' }} />
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Confirmar Contraseña</label>
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Repite la contraseña" style={{ width: '100%' }} />
            </div>
          </div>

          <button type="submit" style={{ backgroundColor: 'var(--accent-color)', padding: '12px', fontSize: '1rem', color: 'white', border: 'none', cursor: 'pointer', marginTop: '15px', borderRadius: '5px', fontWeight: 'bold' }}>
            Crear Cuenta
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
}