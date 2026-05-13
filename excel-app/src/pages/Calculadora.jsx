import React, { useState } from "react";
import Datos from "./Datos";
import Calculos from "./Calculos";
import TablaDinamica from "../components/excel/TablaDinamica";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";

import "../styles/pages/Calculadora.css";

export default function Calculadora() {
    // 1. Ahora solo controlamos si el panel lateral de datos está abierto o cerrado
    const [mostrarDatos, setMostrarDatos] = useState(false);
    const [mostrarCreacion, setMostrarCreacion] = useState(false);

    const [selectedFile, setSelectedFile] = useState("");
    const [selectedSheet, setSelectedSheet] = useState(0);
    const stats = useCalculadoraExcel(selectedFile, selectedSheet);

    return (
        <div className="contenedor-principal-sistema">

            {/* 2. CONTENIDO PRINCIPAL: La Calculadora SIEMPRE está visible por defecto */}
            <div className="ventana-contenido-principal">
                <Calculos stats={stats} />
            </div>

            {/* 3. BOTÓN FLOTANTE LATERAL (Al estilo de las redes sociales) */}
            <div className="flotante-lateral-datos">
                {/* BOTÓN 1: GESTIÓN DE DATOS (Naranja) */}
                <button
                    className="btn-flotante-datos"
                    onClick={() => setMostrarDatos(true)}
                    title="Abrir Gestión de Datos"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                    <span className="texto-flotante">GESTIÓN DE DATOS</span>
                </button>

                {/* BOTÓN 2: CREACIÓN DE TABLAS (Azul) */}
                <button
                    className="btn-flotante-datos btn-crear-tabla"
                    onClick={() => setMostrarCreacion(true)}
                    title="Crear Nueva Tabla de Datos"
                    style={{ backgroundColor: '#3b82f6', marginTop: '10px' }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="3" y1="15" x2="21" y2="15"></line>
                        <line x1="9" y1="3" x2="9" y2="21"></line>
                    </svg>
                    <span className="texto-flotante">CREAR TABLA</span>
                </button>
            </div>

            {/* 4. PANTALLA EMERGENTE (MODAL) PARA LA GESTIÓN DE DATOS */}
            {mostrarDatos && (
                <div className="modal-overlay-datos">
                    <div className="modal-content-datos">

                        {/* Botón rojo para cerrar el panel */}
                        <button className="btn-cerrar-modal" onClick={() => setMostrarDatos(false)}>
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

            {/* 5. PANTALLA EMERGENTE (MODAL) PARA LA CREACIÓN DE TABLAS */}
            {mostrarCreacion && (
                <div className="modal-overlay-datos">
                    <div className="modal-content-datos">
                        <button className="btn-cerrar-modal" onClick={() => setMostrarCreacion(false)}>
                            Cerrar
                        </button>
                        <div style={{ padding: '20px', height: '100%' }}>
                            <TablaDinamica
                                onTablaCreada={() => {
                                    setMostrarCreacion(false);
                                    // Aquí podrías disparar un evento para recargar archivos si fuera necesario
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}