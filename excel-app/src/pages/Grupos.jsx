import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../components/excel/DataContext';

export default function Grupos() {
  const { usuario } = useData();
  const navigate = useNavigate();

  // Estados simulados (Mockups) para la interfaz
  const [misCursos, setMisCursos] = useState([
    { id: 1, nombre: "Estadística Empresarial I", codigo: "EST-101", alumnos: 24, archivos: 3 },
    { id: 2, nombre: "Análisis de Datos Avanzado", codigo: "DAT-205", alumnos: 15, archivos: 5 }
  ]);

  if (!usuario) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '30px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', margin: 0 }}>Gestión Académica y Cursos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: '5px 0 0 0' }}>
            Bienvenido, {usuario.nombres}
          </p>
        </div>
        <span style={{ backgroundColor: 'var(--accent-color)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
          Rol: {usuario.rol}
        </span>
      </div>

      {/* ========================================= */}
      {/* VISTA DEL DOCENTE (Creador de contenido)  */}
      {/* ========================================= */}
      {['Docente', 'Administrador'].includes(usuario.rol) && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--primary-color)', margin: 0 }}>Mis Cursos Impartidos</h2>
            <button style={{ background: 'var(--accent-color)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Crear Nuevo Curso
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {misCursos.map(curso => (
              <div key={curso.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{curso.nombre}</h3>
                <p style={{ margin: '0 0 5px 0', color: 'var(--text-muted)' }}><strong>Código:</strong> {curso.codigo}</p>
                <p style={{ margin: '0 0 15px 0', color: 'var(--text-muted)' }}>👥 {curso.alumnos} Estudiantes | 📁 {curso.archivos} Archivos</p>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ flex: 1, padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Gestionar Archivos
                  </button>
                  <button style={{ flex: 1, padding: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Ver Grupo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* VISTA DEL ESTUDIANTE (Consumidor)         */}
      {/* ========================================= */}
      {usuario.rol === 'Estudiante' && (
        <div>
          {/* Sección para unirse a nuevos cursos */}
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-main)' }}>Explorar e Inscribirse</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ingresa el código del curso (Ej: EST-101)..." 
                style={{ padding: '10px', flex: 1, borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button style={{ background: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Unirse al Curso
              </button>
            </div>
          </div>

          {/* Sección de sus cursos actuales */}
          <h2 style={{ color: '#27ae60', marginBottom: '20px' }}>Mis Clases Activas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {misCursos.map(curso => (
              <div key={curso.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', borderTop: '4px solid #27ae60' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{curso.nombre}</h3>
                <p style={{ margin: '0 0 15px 0', color: 'var(--text-muted)' }}>Profesor: Ing. Asignado</p>
                <button style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid #27ae60', color: '#27ae60', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Entrar al Aula Virtual
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}