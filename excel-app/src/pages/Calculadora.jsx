import React, { useState } from "react";
import Datos from "./Datos";
import Calculos from "./Calculos";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";

import "../styles/pages/Calculadora.css";

export default function Calculadora() { 
    // 1. Ahora solo controlamos si el panel lateral de datos está abierto o cerrado
    const [mostrarDatos, setMostrarDatos] = useState(false);
    
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
                <button 
                    className="btn-flotante-datos"
                    onClick={() => setMostrarDatos(true)}
                    title="Abrir Gestión de Datos"
                >
                    GESTION DE DATOS
                </button>
            </div>

            {/* 4. PANTALLA EMERGENTE (MODAL) PARA LA GESTIÓN DE DATOS */}
            {mostrarDatos && (
                <div className="modal-overlay-datos">
                    <div className="modal-content-datos">
                        
                        {/* Botón rojo para cerrar el panel */}
                        <button 
                            className="btn-cerrar-modal" 
                            onClick={() => setMostrarDatos(false)}
                            title="Cerrar y volver a la calculadora"
                        >
                            ✕ Cerrar
                        </button>

                        <Datos
                            setSelectedFile={setSelectedFile}
                            selectedFile={selectedFile}
                            setSelectedSheet={setSelectedSheet}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}