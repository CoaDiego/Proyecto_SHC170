import React from 'react';
import { useData } from '../excel/DataContext'; 

export default function SelectorRol() {
  const { usuario, setUsuario } = useData();

  // Si no hay usuario, no mostramos el simulador
  if (!usuario) return null;

  const cambiarRol = (nuevoRol) => {
    // 1. Creamos el nuevo objeto de usuario
    const usuarioActualizado = { 
      ...usuario, 
      rol: nuevoRol 
    };
    
    // 2. Actualizamos el estado global (esto debería refrescar Grupos.jsx sin recargar)
    if (typeof setUsuario === 'function') {
      setUsuario(usuarioActualizado);
    }

    // 3. Actualizamos el localStorage para que el cambio persista
    // Asegúrate de que la llave 'usuario' sea la misma que usas en tu Login/App
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

    // 4. Eliminamos window.location.reload() para evitar que te mande al Login
    console.log(`Simulando rol: ${nuevoRol}`);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '20px', // 👈 Movido al lado izquierdo
        zIndex: 999999, 
        background: 'white', 
        padding: '12px', 
        borderRadius: '10px', 
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)', 
        border: '2px solid var(--accent-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>
        Vista de: {usuario.rol}
      </span>
      
      <div style={{ display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => cambiarRol('Administrador')} 
          style={{ 
            background: usuario.rol === 'Administrador' ? 'var(--accent-color)' : '#f3f4f6', 
            color: usuario.rol === 'Administrador' ? 'white' : '#374151', 
            border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
          }}
        >
          Admin
        </button>
        
        <button 
          onClick={() => cambiarRol('Docente')} 
          style={{ 
            background: usuario.rol === 'Docente' ? 'var(--primary-color)' : '#f3f4f6', 
            color: usuario.rol === 'Docente' ? 'white' : '#374151', 
            border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
          }}
        >
          Docente
        </button>
        
        <button 
          onClick={() => cambiarRol('Estudiante')} 
          style={{ 
            background: usuario.rol === 'Estudiante' ? '#10b981' : '#f3f4f6', 
            color: usuario.rol === 'Estudiante' ? 'white' : '#374151', 
            border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold'
          }}
        >
          Usuario
        </button>
      </div>
    </div>
  );
}