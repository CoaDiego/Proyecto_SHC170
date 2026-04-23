import React, { useState } from 'react';

export default function TablaRegresion({ resultado }) {
  const [mostrarTablasCalculo, setMostrarTablasCalculo] = useState(false);

  if (!resultado || resultado.tipo !== "regresion") return null;

  return (
    <>
      {/* 1. TABLA COMPARATIVA PRINCIPAL */}
      <div style={{ padding: "15px", backgroundColor: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        <h4 style={{ marginTop: 0, color: "var(--primary-color)" }}>
          Comparativa de Modelos de Ajuste
        </h4>
        <p style={{ fontSize: "0.9em", color: "var(--text-muted)" }}>
          El sistema ha evaluado automáticamente los 5 modelos clásicos. El modelo con la estrella (⭐) es el que mejor explica la relación (Mayor R²).
        </p>

        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica" style={{ width: "100%", color: "var(--text-color)" }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>Modelo</th>
                <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>Ecuación Predictora</th>
                <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>R² (Ajuste)</th>
                <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>Correlación (r)</th>
                <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>Error (Syx)</th>
              </tr>
            </thead>
            <tbody>
              {resultado.comparativa.map((modelo, index) => (
                <tr key={modelo.tipoModelo} style={{ backgroundColor: index === 0 ? "rgba(46, 125, 50, 0.15)" : "transparent" }}>
                  <td style={{ fontWeight: index === 0 ? "bold" : "normal", textTransform: "capitalize", color: index === 0 ? "#4caf50" : "inherit", borderBottom: "1px solid var(--border-color)" }}>
                    {modelo.tipoModelo} {index === 0 && "⭐"}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "1.1em", borderBottom: "1px solid var(--border-color)" }}>
                    {modelo.ecuacion}
                  </td>
                  <td style={{ fontWeight: index === 0 ? "bold" : "normal", borderBottom: "1px solid var(--border-color)" }}>
                    {(modelo.indicadores.r2 * 100).toFixed(2)}%
                  </td>
                  <td style={{ borderBottom: "1px solid var(--border-color)" }}>
                    {modelo.indicadores.r.toFixed(4)}
                  </td>
                  <td style={{ borderBottom: "1px solid var(--border-color)" }}>
                    {modelo.indicadores.error_estandar.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. BOTÓN Y TABLAS DE CÁLCULO MANUAL */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => setMostrarTablasCalculo(!mostrarTablasCalculo)}
          style={{ width: "100%", padding: "10px", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          {mostrarTablasCalculo ? "Ocultar Tablas de Cálculos" : "Ver Tablas de Cálculos (X, Y, X², Y², XY)"}
        </button>

        {mostrarTablasCalculo && (
          <div style={{ marginTop: "20px" }}>
            {resultado.comparativa.map((modelo) => (
              <div key={modelo.tipoModelo} style={{ marginBottom: "30px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                <h4 style={{ textTransform: "capitalize", color: "var(--accent-color)", borderBottom: "1px solid var(--border-color)", paddingBottom: "5px" }}>
                  Cálculos para Modelo {modelo.tipoModelo}
                </h4>
                <div style={{ overflowX: "auto", marginTop: "10px" }}>
                  <table className="tabla-academica" style={{ width: "100%", textAlign: "center", fontSize: "0.9em", color: "var(--text-color)" }}>
                    <thead>
                      <tr>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>N°</th>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>X (Original)</th>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>Y (Original)</th>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>X (Transf.)</th>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>Y (Transf.)</th>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>X²</th>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>Y²</th>
                        <th style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)" }}>X·Y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modelo.tablaCalculos.filas.map((fila, idx) => (
                        <tr key={idx}>
                          <td style={{ borderBottom: "1px solid var(--border-color)" }}>{idx + 1}</td>
                          <td style={{ borderBottom: "1px solid var(--border-color)" }}>{fila.xOrig.toFixed(4)}</td>
                          <td style={{ borderBottom: "1px solid var(--border-color)" }}>{fila.yOrig.toFixed(4)}</td>
                          <td style={{ backgroundColor: "rgba(128, 128, 128, 0.1)", borderBottom: "1px solid var(--border-color)" }}>{fila.xTrans.toFixed(4)}</td>
                          <td style={{ backgroundColor: "rgba(128, 128, 128, 0.1)", borderBottom: "1px solid var(--border-color)" }}>{fila.yTrans.toFixed(4)}</td>
                          <td style={{ borderBottom: "1px solid var(--border-color)" }}>{fila.x2.toFixed(4)}</td>
                          <td style={{ borderBottom: "1px solid var(--border-color)" }}>{fila.y2.toFixed(4)}</td>
                          <td style={{ borderBottom: "1px solid var(--border-color)" }}>{fila.xy.toFixed(4)}</td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: "bold", backgroundColor: "rgba(128, 128, 128, 0.2)" }}>
                        <td colSpan="3" style={{ textAlign: "right", paddingRight: "10px", borderBottom: "none" }}>SUMATORIAS (Σ):</td>
                        <td style={{ borderBottom: "none" }}>{modelo.tablaCalculos.sumas.sumX.toFixed(4)}</td>
                        <td style={{ borderBottom: "none" }}>{modelo.tablaCalculos.sumas.sumY.toFixed(4)}</td>
                        <td style={{ borderBottom: "none" }}>{modelo.tablaCalculos.sumas.sumX2.toFixed(4)}</td>
                        <td style={{ borderBottom: "none" }}>{modelo.tablaCalculos.sumas.sumY2.toFixed(4)}</td>
                        <td style={{ borderBottom: "none" }}>{modelo.tablaCalculos.sumas.sumXY.toFixed(4)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}