import React, { useState } from "react";
import Datos from "../Datos";
import { useCalculadoraExcel } from "../../hooks/useCalculadoraExcel";
import Principal from '../../components/MAT251/Principal/Principal';
import "../../styles/pages/MAT251/Pantalla.css";

export default function Pantalla() {
  const [mostrarDatos, setMostrarDatos] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);

  const _stats = useCalculadoraExcel(selectedFile, selectedSheet);

  return (
    <div className="contenedor-principal-sistema">
      {/* VENTANA PRINCIPAL: CÁLCULOS (Principal.jsx) */}
      <div className="ventana-contenido-principal">
        <Principal />
      </div>

      {/* MENÚ FLOTANTE RADIAL */}
      <div className={`menu-flotante-radial ${menuAbierto ? 'abierto' : ''}`}>
        
        {/* Botón Principal (Toggle) */}
        <button
          className="fab-main"
          onClick={() => setMenuAbierto(!menuAbierto)}
          title="Menú de Herramientas"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {/* Botón 1: Gestión de Datos */}
        <button
          className="fab-item item-1"
          onClick={() => { setMostrarDatos(true); setMenuAbierto(false); }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          <span className="fab-tooltip">Gestión de Datos</span>
        </button>

        {/* Botón 2: Placeholder 1 */}
        <button
          className="fab-item item-2"
          onClick={() => alert("Próximamente 1")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
          <span className="fab-tooltip">Creación de Tablas</span>
        </button>

        {/* Botón 3: Placeholder 2 */}
        <button
          className="fab-item item-3"
          onClick={() => alert("Próximamente 2")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="fab-tooltip">Reportes Extras</span>
        </button>
      </div>

      {/* MODAL DE GESTIÓN DE DATOS */}
      {mostrarDatos && (
        <div className="modal-overlay-datos">
          <div className="modal-content-datos">
            <button
              className="btn-cerrar-modal"
              onClick={() => setMostrarDatos(false)}
            >
              Cerrar
            </button>
            <Datos
              setSelectedFile={setSelectedFile}
              selectedFile={selectedFile}
              setSelectedSheet={setSelectedSheet}
            />
          </div>
        </div>
      )}

      {/* ESTADO DEL ARCHIVO */}
      {selectedFile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          border: '1px solid #86efac',
          color: '#166534',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          Archivo cargado: {selectedFile}
        </div>
      )}
    </div>
  );
}