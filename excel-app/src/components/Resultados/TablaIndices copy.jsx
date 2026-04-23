import React, { useState } from 'react';

export default function TablaIndices({ resultado }) {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  if (!resultado) return null;

  // ==========================================
  // MÓDULO 1: ÍNDICES COMPUESTOS
  // ==========================================
  if (resultado.tipo === "indices_compuestos") {
    return (
      <div style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '15px' }}>
        
        {/* Tarjetas de Resultados */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: 'rgba(25, 118, 210, 0.1)', border: '1px solid #1976d2', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>Índice de Laspeyres</h4>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.laspeyres.toFixed(2)}%</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>(Cantidades Base)</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'rgba(56, 142, 60, 0.1)', border: '1px solid #388e3c', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#388e3c' }}>Índice de Paasche</h4>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.paasche.toFixed(2)}%</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>(Cantidades Actuales)</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: 'rgba(245, 124, 0, 0.1)', border: '1px solid #f57c00', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#f57c00' }}>Índice de Fisher</h4>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.fisher.toFixed(2)}%</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>(Índice Ideal)</p>
          </div>
        </div>

        {/* Botón Detalles */}
        <button onClick={() => setMostrarDetalles(!mostrarDetalles)} style={{ width: "100%", padding: "10px", backgroundColor: "var(--bg-secondary)", color: "var(--text-color)", border: "1px solid var(--border-color)", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          {mostrarDetalles ? "Ocultar Tabla de Cálculos" : "Ver Tabla de Pasos (P₀Q₀, PtQ₀, etc.)"}
        </button>

        {mostrarDetalles && (
          <div style={{ overflowX: "auto", marginTop: "15px" }}>
            <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Ítem</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>P₀</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Q₀</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Pt</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Qt</th>
                  <th style={{ backgroundColor: 'rgba(25, 118, 210, 0.2)', borderBottom: '1px solid var(--border-color)' }}>Pt·Q₀</th>
                  <th style={{ backgroundColor: 'rgba(25, 118, 210, 0.2)', borderBottom: '1px solid var(--border-color)' }}>P₀·Q₀</th>
                  <th style={{ backgroundColor: 'rgba(56, 142, 60, 0.2)', borderBottom: '1px solid var(--border-color)' }}>Pt·Qt</th>
                  <th style={{ backgroundColor: 'rgba(56, 142, 60, 0.2)', borderBottom: '1px solid var(--border-color)' }}>P₀·Qt</th>
                </tr>
              </thead>
              <tbody>
                {resultado.detalles.map((fila, idx) => (
                  <tr key={idx}>
                    <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.item}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.P0}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Q0}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Pt}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Qt}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Pt_Q0.toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.P0_Q0.toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Pt_Qt.toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.P0_Qt.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: 'rgba(128, 128, 128, 0.1)' }}>
                  <td colSpan="5" style={{ textAlign: 'right', paddingRight: '10px' }}>SUMATORIAS (Σ):</td>
                  <td>{resultado.sumatorias.sum_Pt_Q0.toFixed(2)}</td>
                  <td>{resultado.sumatorias.sum_P0_Q0.toFixed(2)}</td>
                  <td>{resultado.sumatorias.sum_Pt_Qt.toFixed(2)}</td>
                  <td>{resultado.sumatorias.sum_P0_Qt.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // MÓDULO 2: EMPALME Y CAMBIO DE BASE
  // ==========================================
  if (resultado.tipo === "operaciones_indices") {
    return (
      <div style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '15px' }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Periodo (t)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Índice Original</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Nuevo Índice (Cambio Base)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Índice Eslabón (Cadena)</th>
              </tr>
            </thead>
            <tbody>
              {resultado.datos.map((fila, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'rgba(128,128,128,0.05)' : 'transparent' }}>
                  <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.t}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.indice_original.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: '#1976d2', fontWeight: 'bold' }}>{fila.nuevo_indice.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: '#f57c00' }}>{fila.eslabon ? fila.eslabon.toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // MÓDULO 3: DEFLACIÓN FINANCIERA
  // ==========================================
  if (resultado.tipo === "deflacion_financiera") {
    return (
      <div style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '15px' }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Periodo (t)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Valor Nominal ($)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>IPC</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Valor Real ($)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Poder Adquisitivo</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Inflación (%)</th>
              </tr>
            </thead>
            <tbody>
              {resultado.datos.map((fila, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'rgba(128,128,128,0.05)' : 'transparent' }}>
                  <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.t}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.nominal.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.ipc.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: '#388e3c', fontWeight: 'bold' }}>{fila.real.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.poder_adquisitivo.toFixed(4)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: fila.inflacion > 0 ? '#d32f2f' : '#388e3c' }}>
                    {fila.inflacion !== null ? `${fila.inflacion > 0 ? '+' : ''}${fila.inflacion.toFixed(2)}%` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}