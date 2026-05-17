import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Perfil({ usuario, setUsuario }) {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    setUsuario(null); 
    navigate('/login'); 
  };

  if (!usuario) return null; 

  // Función UX para sacar las iniciales (ej: "Juan Pérez" -> "JP")
  const getIniciales = (nombre) => {
    if (!nombre) return '👤';
    // Removemos cualquier texto entre paréntesis o corchetes para limpiar el nombre
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
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      
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
        {/* Cabecera decorativa naranja para darle el toque corporativo */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '110px', backgroundColor: 'var(--accent-color)' }}></div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', position: 'relative', zIndex: 1, marginTop: '20px' }}>
            
            {/* Avatar circular con borde blanco que se sobrepone a la cabecera */}
            <div style={{ 
              width: '110px', height: '110px', borderRadius: '50%', backgroundColor: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', 
              fontWeight: 'bold', color: 'var(--accent-color)', border: '5px solid var(--bg-card)', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)', marginBottom: '15px' 
            }}>
              {getIniciales(usuario.nombre)}
            </div>
            
            {/* Datos Principales */}
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 5px 0', color: 'var(--text-main)' }}>
              {usuario.nombre}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 20px 0' }}>
              {usuario.email || "usuario@correo.com"}
            </p>
            
            {/* Insignias / Badges Dinámicos */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Insignia del Perfil de uso */}
              <span style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', color: '#d35400', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                 {usuario.perfil || usuario.rol || 'Estudiante Externo'}
              </span>
              
              {/* Insignia de la Institución (Solo se muestra si el usuario llenó el campo) */}
              {usuario.institucion && (
                <span style={{ backgroundColor: 'rgba(41, 128, 185, 0.1)', color: '#2980b9', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                   {usuario.institucion}
                </span>
              )}
            </div>

            {/* Panel de Estadísticas (Mockup visual para rellenar el espacio elegantemente) */}
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

            {/* Botones de Acción */}
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
    </div>
  );
}