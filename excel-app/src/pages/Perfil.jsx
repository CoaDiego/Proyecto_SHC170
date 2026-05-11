import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Perfil({ usuario, setUsuario }) {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    // 1. Borramos los datos del usuario para "cerrar sesión"
    setUsuario(null); 
    // 2. Lo mandamos de vuelta a la pantalla de Login
    navigate('/login'); 
  };

  // Por si el usuario llega aquí sin estar logueado por error
  if (!usuario) return null; 

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Mi Perfil</h2>
      
      <div className="grafico-card" style={{ padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Avatar grande */}
        <div className="avatar-naranja" style={{ width: '80px', height: '80px', fontSize: '2.5rem', marginBottom: '20px' }}>
          {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
        </div>
        
        {/* Datos del usuario */}
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{usuario.nombre}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
          Rol: <span style={{ fontWeight: 'normal' }}>{usuario.rol}</span>
        </p>
        
        {/* Si en tu usuarios.json tienes más campos (como institucion o email), puedes agregarlos aquí */}
        {usuario.institucion && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' }}>
            Institución: <span style={{ fontWeight: 'normal' }}>{usuario.institucion}</span>
          </p>
        )}

        <hr style={{ width: '100%', margin: '30px 0', borderColor: 'var(--border-color)', opacity: 0.5 }} />

        {/* Botón de Cerrar Sesión */}
        <button 
          onClick={handleCerrarSesion}
          style={{ backgroundColor: '#dc2626', color: 'white', padding: '10px 20px', width: '100%', maxWidth: '200px' }}
        >
          Cerrar Sesión
        </button>
        
      </div>
    </div>
  );
}