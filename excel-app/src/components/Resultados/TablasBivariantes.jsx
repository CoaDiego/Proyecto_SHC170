import React from "react";
import Latex from "../excel/Latex"; 
import { copiarTablaAExcel } from "../../utils/exportUtils";
import { IconoCopiar } from "../ui/iconos";

export default function TablasBivariantes({ resultado, formatearCelda }) {
  // Atrapamos el nuevo nombre de la función unificada
  if (!resultado || resultado.tipo !== "distribucion_bivariada") {
    return null;
  }

  return (
    <div className="contenedor-bivariada">
      <h4>Tema 5: Tabla de Distribución Bivariante</h4>

      {/* --- TARJETAS INTELIGENTES (Solo aparecen si hay números) --- */}
      {resultado.ambosNumericos && (
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", borderLeft: "4px solid #3498db" }}>
            <h5 style={{ margin: "0 0 10px 0", color: "var(--text-muted)" }}>Covarianza (Sxy)</h5>
            <p style={{ fontSize: "1.5em", margin: 0, fontWeight: "bold" }}>
              {formatearCelda(resultado.covarianza)}
            </p>
          </div>
          <div style={{ flex: 1, minWidth: "200px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", borderLeft: "4px solid #2ecc71" }}>
            <h5 style={{ margin: "0 0 10px 0", color: "var(--text-muted)" }}>Correlación (r)</h5>
            <p style={{ fontSize: "1.5em", margin: 0, fontWeight: "bold" }}>
              {formatearCelda(resultado.correlacion)}
            </p>
          </div>
          <div style={{ flex: 2, minWidth: "250px", padding: "15px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", borderLeft: "4px solid #9b59b6" }}>
            <h5 style={{ margin: "0 0 10px 0", color: "var(--text-muted)" }}>Interpretación</h5>
            <p style={{ fontSize: "1.2em", margin: 0, fontWeight: "bold", color: "var(--primary-color)" }}>
              {resultado.interpretacion}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h5 style={{ color: "var(--text-color)", margin: 0 }}>
          Tabla de Frecuencias Conjuntas y Marginales
        </h5>
        <button 
          className="btn-icon"
          onClick={() => copiarTablaAExcel(resultado.matrizPura, "bivariada")}
          style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          title="Copiar datos puros para Excel"
        >
          <IconoCopiar /> Copiar Tabla
        </button>
      </div>
      <div style={{ overflowX: "auto", paddingBottom: "20px" }}>
        <table className="tabla-academica">
          <thead>
            <tr>
              <th style={{ background: "transparent", border: "none" }}></th>
              <th colSpan={resultado.columnas.length} style={{ backgroundColor: "var(--accent-color)", color: "#fff", textAlign: "center" }}>
                VARIABLE Y
              </th>
              <th style={{ backgroundColor: "#2c3e50", color: "#fff" }}>Totales X</th>
            </tr>
            <tr>
              <th style={{ backgroundColor: "var(--accent-color)", color: "#fff" }}>VARIABLE X</th>
              {resultado.columnas.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th style={{ backgroundColor: "#2c3e50", color: "#fff" }}>
                <Latex formula="f_{i \cdot}" /> / %
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Cuerpo de la tabla */}
            {resultado.filas.map((fila) => (
              <tr key={fila}>
                <td className="celda-x" style={{ fontWeight: "bold", backgroundColor: "var(--bg-card)" }}>{fila}</td>
                {resultado.columnas.map((col) => {
                  const f_ij = resultado.datos[fila][col];
                  const p_ij = ((f_ij / resultado.granTotal) * 100).toFixed(1);
                  return (
                    <td key={col} style={{ textAlign: "center" }}>
                      <strong>{f_ij}</strong>
                      <br />
                      <small style={{ color: "var(--text-muted)" }}>
                        <Latex formula={`p_{ij}=${p_ij}\\%`} />
                      </small>
                    </td>
                  );
                })}
                {/* Total Marginal X */}
                <td className="celda-total" style={{ fontWeight: "bold", backgroundColor: "#e8f6f3", color: "#16a085", textAlign: "center" }}>
                  <strong>{resultado.totalFilas[fila]}</strong>
                  <br />
                  <small>
                    {((resultado.totalFilas[fila] / resultado.granTotal) * 100).toFixed(1)} %
                  </small>
                </td>
              </tr>
            ))}

            {/* Fila Final: Totales Marginales Y */}
            <tr>
              <td className="celda-total" style={{ fontWeight: "bold", backgroundColor: "#2c3e50", color: "#fff" }}>
                Totales Y
              </td>
              {resultado.columnas.map((col) => (
                <td key={col} className="celda-total" style={{ fontWeight: "bold", backgroundColor: "#e8f6f3", color: "#16a085", textAlign: "center" }}>
                  <strong>{resultado.totalColumnas[col]}</strong>
                  <br />
                  <small>
                    {((resultado.totalColumnas[col] / resultado.granTotal) * 100).toFixed(1)} %
                  </small>
                </td>
              ))}
              {/* Gran Total (n) */}
              <td className="celda-total" style={{ fontWeight: "bold", fontSize: "1.2em", backgroundColor: "#27ae60", color: "#fff", textAlign: "center" }}>
                n = {resultado.granTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}