// src/components/resultados/TablasBivariantes.jsx
import React from "react";
import Latex from "../excel/Latex"; // Importamos tu componente Latex


export default function TablasBivariantes({ resultado, formatearCelda }) {
  // Si no hay resultado o no es del tipo correcto, no dibujamos nada
  if (!resultado || (resultado.tipo !== "bivariada" && resultado.tipo !== "bivariada_avanzada")) {
    return null;
  }

  // --- MODO AVANZADO (Covarianza, Correlación y Tabla Marginal) ---
  if (resultado.tipo === "bivariada_avanzada") {
    return (
      <div className="contenedor-bivariada-avanzada">
        <h4>Tema 5: Análisis Bivariante, Covarianza y Correlación</h4>

        {/* TARJETAS DE CORRELACIÓN Y COVARIANZA */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", borderLeft: "4px solid #3498db" }}>
            <h5 style={{ margin: "0 0 10px 0", color: "var(--text-muted)" }}>Covarianza (Sxy)</h5>
            <p style={{ fontSize: "1.5em", margin: 0, fontWeight: "bold" }}>
              {resultado.esNumerico ? formatearCelda(resultado.covarianza) : "N/A"}
            </p>
          </div>
          <div style={{ flex: 1, minWidth: "200px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", borderLeft: "4px solid #2ecc71" }}>
            <h5 style={{ margin: "0 0 10px 0", color: "var(--text-muted)" }}>Correlación (r)</h5>
            <p style={{ fontSize: "1.5em", margin: 0, fontWeight: "bold" }}>
              {resultado.esNumerico ? formatearCelda(resultado.correlacion) : "N/A"}
            </p>
          </div>
          <div style={{ flex: 2, minWidth: "250px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", borderLeft: "4px solid #9b59b6" }}>
            <h5 style={{ margin: "0 0 10px 0", color: "var(--text-muted)" }}>Interpretación de la Relación</h5>
            <p style={{ fontSize: "1.2em", margin: 0, fontWeight: "bold", color: "var(--primary-color)" }}>
              {resultado.interpretacion}
            </p>
          </div>
        </div>

        {/* TABLA DE FRECUENCIAS CONJUNTAS Y MARGINALES */}
        <h5 style={{ color: "var(--text-color)", marginBottom: "10px" }}>
          Tabla de Doble Entrada (Conjuntas y Marginales)
        </h5>
        <div style={{ overflowX: "auto", paddingBottom: "20px" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th style={{ backgroundColor: "var(--accent-color)", color: "#fff" }}>X \ Y</th>
                {resultado.columnas.map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
                <th style={{ backgroundColor: "#2c3e50", color: "#fff" }}>Total Marginal (X)</th>
              </tr>
            </thead>
            <tbody>
              {resultado.filas.map((fila, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "bold", backgroundColor: "var(--bg-card)" }}>{fila}</td>
                  {resultado.columnas.map((col, j) => (
                    <td key={j}>{resultado.datos[fila][col]}</td>
                  ))}
                  <td style={{ fontWeight: "bold", backgroundColor: "#e8f6f3", color: "#16a085" }}>
                    {resultado.totalFilas[fila]}
                  </td>
                </tr>
              ))}
              {/* FILA DE TOTALES MARGINALES DE Y */}
              <tr>
                <td style={{ fontWeight: "bold", backgroundColor: "#2c3e50", color: "#fff" }}>
                  Total Marginal (Y)
                </td>
                {resultado.columnas.map((col, idx) => (
                  <td key={idx} style={{ fontWeight: "bold", backgroundColor: "#e8f6f3", color: "#16a085" }}>
                    {resultado.totalColumnas[col]}
                  </td>
                ))}
                <td style={{ fontWeight: "bold", fontSize: "1.2em", backgroundColor: "#27ae60", color: "#fff" }}>
                  {resultado.granTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- MODO BÁSICO (Solo porcentajes) ---
  if (resultado.tipo === "bivariada") {
    return (
      <div style={{ overflowX: "auto" }}>
        <table className="tabla-academica">
          <thead>
            <tr>
              <th style={{ background: "transparent", border: "none" }}></th>
              <th colSpan={resultado.columnas.length}>
                VARIABLE Y
              </th>
              <th>Total</th>
            </tr>
            <tr>
              <th>VARIABLE X</th>
              {resultado.columnas.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th>
                <Latex formula="f_{i \cdot}" /> / %
              </th>
            </tr>
          </thead>
          <tbody>
            {resultado.filas.map((fila) => (
              <tr key={fila}>
                <td className="celda-x">{fila}</td>
                {resultado.columnas.map((col) => {
                  const f_ij = resultado.datos[fila][col];
                  const p_ij = ((f_ij / resultado.granTotal) * 100).toFixed(1);
                  return (
                    <td key={col}>
                      <strong>{f_ij}</strong>
                      <br />
                      <small style={{ color: "var(--text-muted)" }}>
                        <Latex formula={`p_{ij}=${p_ij}\\%`} />
                      </small>
                    </td>
                  );
                })}
                <td className="celda-total">
                  <strong>{resultado.totalFilas[fila]}</strong>
                  <br />
                  <small>
                    {((resultado.totalFilas[fila] / resultado.granTotal) * 100).toFixed(1)} %
                  </small>
                </td>
              </tr>
            ))}
            <tr>
              <td className="celda-total">Total</td>
              {resultado.columnas.map((col) => (
                <td key={col} className="celda-total">
                  <strong>{resultado.totalColumnas[col]}</strong>
                  <br />
                  <small>
                    {((resultado.totalColumnas[col] / resultado.granTotal) * 100).toFixed(1)} %
                  </small>
                </td>
              ))}
              <td className="celda-total">n = {resultado.granTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}