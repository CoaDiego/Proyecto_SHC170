import React, { useState } from "react";
import Datos from "../Datos";
import { useCalculadoraExcel } from "../../hooks/useCalculadoraExcel";
import Principal from '../../components/MAT251/Principal/Principal';
import "../../styles/pages/MAT251/Pantalla.css";

export default function Pantalla() {
  const [mostrarDatos, setMostrarDatos] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);

  const _stats = useCalculadoraExcel(selectedFile, selectedSheet);

  return (
    <div className="contenedor-principal-sistema">
      {/* VENTANA PRINCIPAL: CÁLCULOS (Principal.jsx) */}
      <div className="ventana-contenido-principal">
        <Principal />
      </div>

      {/* BOTÓN FLOTANTE PARA GESTIÓN DE DATOS */}
      <div className="flotante-lateral-datos">
        <button
          className="btn-flotante-datos"
          onClick={() => setMostrarDatos(true)}
          title="Abrir Gestión de Datos"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          <span className="texto-flotante">GESTIÓN DE DATOS</span>
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