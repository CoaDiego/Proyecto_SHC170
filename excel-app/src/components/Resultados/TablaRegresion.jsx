import React, { useState } from 'react';

export default function TablaRegresion({ resultado }) {
  const [mostrarTablasCalculo, setMostrarTablasCalculo] = useState(false);

  if (!resultado || resultado.tipo !== "regresion") return null;

  // Lógica para decidir qué columnas mostrar y qué tooltips poner
  const getConfig = (modelo) => {
    const tipo = modelo.tipoModelo;
    const c = {
      esPolinomial: ["cuadratica", "cubica"].includes(tipo),
      mostrarTransX: false,
      mostrarTransY: false,
      columnasExtra: [], // Para X^3, X^4, X^2Y, etc.
      labelX: "X",
      labelY: "Y"
    };

    // 1. CONFIGURACIÓN PARA MODELOS CON TRANSFORMACIÓN (Intrínsecamente Lineales)
    if (tipo === "logaritmica") { c.mostrarTransX = true; c.labelX = "ln(X)"; }
    if (tipo === "exponencial") { c.mostrarTransY = true; c.labelY = "ln(Y)"; }
    if (tipo === "potencial") { c.mostrarTransX = true; c.mostrarTransY = true; c.labelX = "ln(X)"; c.labelY = "ln(Y)"; }
    if (tipo === "reciproco") { c.mostrarTransX = true; c.labelX = "1/X"; }

    // 2. CONFIGURACIÓN PARA MODELOS POLINOMIALES (Los nuevos)
    if (tipo === "cuadratica") {
      c.columnasExtra = [
        { key: 'x3', label: 'X³', tooltip: (f) => `${f.xOrig}³` },
        { key: 'x4', label: 'X⁴', tooltip: (f) => `${f.xOrig}⁴` },
        { key: 'x2y', label: 'X²·Y', tooltip: (f) => `(${f.xOrig}²) · ${f.yOrig}` }
      ];
    }
    if (tipo === "cubica") {
      c.columnasExtra = [
        { key: 'x3', label: 'X³', tooltip: (f) => `${f.xOrig}³` },
        { key: 'x4', label: 'X⁴', tooltip: (f) => `${f.xOrig}⁴` },
        { key: 'x5', label: 'X⁵', tooltip: (f) => `${f.xOrig}⁵` },
        { key: 'x6', label: 'X⁶', tooltip: (f) => `${f.xOrig}⁶` },
        { key: 'x2y', label: 'X²·Y', tooltip: (f) => `(${f.xOrig}²) · ${f.yOrig}` },
        { key: 'x3y', label: 'X³·Y', tooltip: (f) => `(${f.xOrig}³) · ${f.yOrig}` }
      ];
    }

    return c;
  };

  return (
    <>
      {/* 1. TABLA COMPARATIVA */}
      <div style={{ padding: "15px", backgroundColor: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        <h4 style={{ marginTop: 0, color: "var(--primary-color)" }}>Comparativa de Modelos de Ajuste (n = {resultado.comparativa[0].tablaCalculos.filas.length})</h4>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica" style={{ width: "100%", textAlign: "center" }}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Ecuación Predictora Final</th>
                <th title="Coeficiente de Determinación">R²</th>
                <th title="Error Estándar">Syx</th>
              </tr>
            </thead>
            <tbody>
              {resultado.comparativa.map((m, i) => (
                <tr key={m.tipoModelo} style={{ backgroundColor: i === 0 ? "rgba(76, 175, 80, 0.1)" : "transparent" }}>
                  <td style={{ fontWeight: i === 0 ? "bold" : "normal", textTransform: "capitalize" }}>{m.tipoModelo} {i === 0 && "⭐"}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "1.05em" }}>{m.ecuacion}</td>
                  <td style={{ fontWeight: "bold" }}>{(m.indicadores.r2 * 100).toFixed(2)}%</td>
                  <td>{m.indicadores.error_estandar.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. TABLAS DE DESARROLLO MATEMÁTICO */}
      <div style={{ marginTop: "30px" }}>
        <button
          onClick={() => setMostrarTablasCalculo(!mostrarTablasCalculo)}
          style={{ width: "100%", padding: "12px", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          {mostrarTablasCalculo ? "Ocultar Tablas de Desarrollo" : "Ver Desarrollo Matemático Paso a Paso"}
        </button>

        {mostrarTablasCalculo && (
          <div style={{ marginTop: "20px" }}>
            {resultado.comparativa.map((m) => {
              const c = getConfig(m);
              const sumas = m.tablaCalculos.sumas;

              return (
                <div key={m.tipoModelo} style={{ marginBottom: "40px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                  <h4 style={{ textTransform: "capitalize", color: "var(--accent-color)", borderBottom: "2px solid var(--accent-color)", paddingBottom: "5px" }}>
                    Desarrollo: Modelo {m.tipoModelo}
                  </h4>
                  <div style={{ overflowX: "auto" }}>
                    <table className="tabla-academica" style={{ width: "100%", textAlign: "center", fontSize: "0.85em" }}>
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th title="Valor original X">X</th>
                          <th title="Valor original Y">Y</th>
                          {/* Columnas de Transformación */}
                          {c.mostrarTransX && <th style={{backgroundColor: 'rgba(25,118,210,0.1)'}}>{c.labelX}</th>}
                          {c.mostrarTransY && <th style={{backgroundColor: 'rgba(25,118,210,0.1)'}}>{c.labelY}</th>}
                          {/* Columnas Matemáticas Comunes */}
                          <th title={`(${c.labelX})²`}>X²</th>
                          <th title={`(${c.labelY})²`}>Y²</th>
                          <th title={`(${c.labelX}) · (${c.labelY})`}>X·Y</th>
                          {/* Columnas Extra para Polinomiales */}
                          {c.columnasExtra.map(col => <th key={col.key} style={{backgroundColor: 'rgba(156,39,176,0.1)'}}>{col.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {m.tablaCalculos.filas.map((f, i) => (
                          <tr key={i} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td>{i + 1}</td>
                            <td title="Dato de entrada">{f.xOrig.toFixed(2)}</td>
                            <td title="Dato de entrada">{f.yOrig.toFixed(2)}</td>
                            
                            {c.mostrarTransX && <td title={`ln(${f.xOrig})`} style={{backgroundColor: 'rgba(25,118,210,0.02)'}}>{f.xTrans.toFixed(4)}</td>}
                            {c.mostrarTransY && <td title={`ln(${f.yOrig})`} style={{backgroundColor: 'rgba(25,118,210,0.02)'}}>{f.yTrans.toFixed(4)}</td>}
                            
                            <td title={`${f.xTrans.toFixed(4)}²`}>{f.x2.toFixed(4)}</td>
                            <td title={`${f.yTrans.toFixed(4)}²`}>{f.y2.toFixed(4)}</td>
                            <td title={`${f.xTrans.toFixed(4)} · ${f.yTrans.toFixed(4)}`}>{f.xy.toFixed(4)}</td>

                            {/* Celdas Extra Polinomiales con sus tooltips específicos */}
                            {c.columnasExtra.map(col => (
                              <td key={col.key} title={col.tooltip(f)} style={{backgroundColor: 'rgba(156,39,176,0.02)'}}>
                                {f[col.key]?.toFixed(4) || "0.0000"}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr style={{ fontWeight: "bold", backgroundColor: "rgba(128, 128, 128, 0.15)" }}>
                          <td colSpan={3 + (c.mostrarTransX?1:0) + (c.mostrarTransY?1:0)}>Σ SUMATORIAS:</td>
                          <td>{sumas.sumX2.toFixed(4)}</td>
                          <td>{sumas.sumY2.toFixed(4)}</td>
                          <td>{sumas.sumXY.toFixed(4)}</td>
                          {c.columnasExtra.map(col => <td key={col.key}>{sumas[col.key]?.toFixed(4) || "0.0000"}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}