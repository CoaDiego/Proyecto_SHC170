import React from 'react';
import { FONT, FS, RADIUS } from '../Principal/Constantes';

export default function ArbolProbabilidad({ resultado, ramas }) {
    if (!resultado || !ramas || ramas.length === 0) return null;

    const width = 800;
    const height = Math.max(400, ramas.length * 140);
    const rootX = 60, rootY = height / 2, nodeAX = 380, nodeBX = 680;
    const highlightColor = '#0ea5e9', dimColor = '#94a3b8';

    return (
        <div style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-card)', borderRadius: RADIUS, border: `1px solid var(--border-color)`, padding: '20px', marginTop: '15px' }}>
            <h4 style={{ textAlign: 'center', color: 'var(--text-main)', marginBottom: '20px', fontSize: FS.sm }}>Diagrama de Árbol de Decisiones</h4>
            <svg width={width} height={height} style={{ minWidth: '750px', display: 'block', margin: '0 auto', fontFamily: FONT }}>

                {/* NODO RAÍZ */}
                <rect x={rootX - 45} y={rootY - 15} width="45" height="30" rx="15" fill="var(--primary-color)" />
                <text x={rootX - 22} y={rootY + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">Inicio</text>
                <circle cx={rootX} cy={rootY} r="4" fill="white" />

                {resultado.desglose.map((rama, i) => {
                    const ySpacing = height / (ramas.length + 1);
                    const nodeAY = ySpacing * (i + 1);

                    // --- Textos dinámicos ---
                    const label1Text = `P(${rama.nombre})=${rama.pA.toFixed(4)}`;
                    const label2Text = `P(B|${rama.nombre})=${rama.pB_A.toFixed(4)}`;
                    const pillText = rama.nombre;

                    // --- Anchos aproximados basados en longitud de texto ---
                    // Se usa un multiplicador (aprox 7px por caracter) + un padding
                    const wPill = Math.max(70, pillText.length * 8 + 20);
                    const wLabel1 = Math.max(110, label1Text.length * 6.8 + 16);
                    const wLabel2 = Math.max(120, label2Text.length * 6.8 + 16);

                    const pillX = nodeAX - wPill; // El nodo crece hacia la izquierda

                    // Puntos medios geométricos precisos para las etiquetas
                    const midX1 = (rootX + pillX) / 2;
                    const midY1 = (rootY + nodeAY) / 2;

                    const midX2 = (nodeAX + nodeBX - 70) / 2;
                    const midY2 = (nodeAY + nodeAY - 35) / 2;

                    const midX3 = (nodeAX + nodeBX - 70) / 2;
                    const midY3 = (nodeAY + nodeAY + 35) / 2;

                    return (
                        <g key={rama.id}>
                            {/* === RAMA PRINCIPAL (Hacia A_i) === */}
                            <line
                                x1={rootX} y1={rootY}
                                x2={pillX} y2={nodeAY}
                                stroke={highlightColor} strokeWidth="2.5" opacity="0.9"
                            />

                            {/* Etiqueta P(A_i) sobre la línea */}
                            <rect x={midX1 - wLabel1 / 2} y={midY1 - 12} width={wLabel1} height="24" rx="4" fill="white" stroke={highlightColor} strokeWidth="1" />
                            <text x={midX1} y={midY1 + 4} textAnchor="middle" fontSize="11" fill={highlightColor} fontWeight="bold">
                                {label1Text}
                            </text>

                            {/* Nodo A_i (Píldora dinámica) */}
                            <rect x={pillX} y={nodeAY - 14} width={wPill} height="28" rx="14" fill={highlightColor} />
                            <text x={pillX + wPill / 2} y={nodeAY + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">
                                {pillText}
                            </text>

                            {/* === SUB-RAMA ÉXITO (Hacia B) === */}
                            <line
                                x1={nodeAX} y1={nodeAY}
                                x2={nodeBX - 70} y2={nodeAY - 35}
                                stroke={highlightColor} strokeWidth="2"
                            />
                            {/* Etiqueta P(B|A_i) */}
                            <rect x={midX2 - wLabel2 / 2} y={midY2 - 12} width={wLabel2} height="24" rx="4" fill="white" stroke={highlightColor} strokeWidth="1" />
                            <text x={midX2} y={midY2 + 4} textAnchor="middle" fontSize="11" fill={highlightColor} fontWeight="bold">
                                {label2Text}
                            </text>

                            {/* Nodo B (Éxito) */}
                            <rect x={nodeBX - 70} y={nodeAY - 35 - 12} width="70" height="24" rx="4" fill={highlightColor} />
                            <text x={nodeBX - 35} y={nodeAY - 35 + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">B (Éxito)</text>

                            {/* Multiplicador Final */}
                            <text x={nodeBX + 10} y={nodeAY - 35 + 4} fontSize="12" fontWeight="bold" fill={highlightColor}>
                                = {rama.mult.toFixed(4)}
                            </text>

                            {/* === SUB-RAMA FRACASO (Hacia B') === */}
                            <line
                                x1={nodeAX} y1={nodeAY}
                                x2={nodeBX - 70} y2={nodeAY + 35}
                                stroke={dimColor} strokeWidth="1.5" strokeDasharray="5,5"
                            />
                            {/* Etiqueta P(B'|A_i) */}
                            <rect x={midX3 - 25} y={midY3 - 10} width="50" height="20" rx="4" fill="white" stroke={dimColor} strokeWidth="1" />
                            <text x={midX3} y={midY3 + 4} textAnchor="middle" fontSize="10" fill={dimColor}>
                                {(1 - rama.pB_A).toFixed(4)}
                            </text>

                            {/* Nodo B' (Otro) */}
                            <rect x={nodeBX - 70} y={nodeAY + 35 - 10} width="70" height="20" rx="4" fill="white" stroke={dimColor} strokeWidth="1" />
                            <text x={nodeBX - 35} y={nodeAY + 35 + 4} textAnchor="middle" fontSize="10" fill={dimColor}>B' (Otro)</text>
                        </g>
                    );
                })}
            </svg>
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: FS.xs, color: 'var(--text-muted)' }}>
                <span style={{ color: highlightColor, fontWeight: 'bold' }}>■</span> Rutas ponderadas que conforman la Probabilidad Total del evento analizado
            </div>
        </div>
    );
}
