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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        {/* Botón 1: Gestión de Datos */}
        <button
          className="fab-item item-1"
          onClick={() => { setMostrarDatos(true); setMenuAbierto(false); }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span className="fab-tooltip">Análisis Adicional</span>
        </button>

        {/* Botón 3: Placeholder 2 */}
        <button
          className="fab-item item-3"
          onClick={() => alert("Próximamente 2")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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