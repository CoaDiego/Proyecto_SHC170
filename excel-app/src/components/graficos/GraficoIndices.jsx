import React from 'react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';

export default function GraficoIndices({ resultado }) {
  if (!resultado) return null;

  // ==========================================
  // GRÁFICO 1: ÍNDICES COMPUESTOS
  // ==========================================
  if (resultado.tipo === "indices_compuestos") {
    const dataGrafico = [
      { nombre: 'Laspeyres', valor: resultado.resultados.laspeyres, fill: '#1976d2' },
      { nombre: 'Fisher (Ideal)', valor: resultado.resultados.fisher, fill: '#f57c00' },
      { nombre: 'Paasche', valor: resultado.resultados.paasche, fill: '#388e3c' }
    ];

    // Para que el gráfico no empiece en 0 y se vean mejor las diferencias
    const minVal = Math.floor(Math.min(...dataGrafico.map(d => d.valor)) - 5);

    return (
      <div className="grafico-card" style={{ width: "100%", height: "400px", padding: "20px", backgroundColor: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)", marginTop: "15px" }}>
        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-color)' }}>Comparativa de Índices de Precios/Cantidades</h4>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={dataGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
            <XAxis dataKey="nombre" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis domain={[minVal, 'auto']} tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} formatter={(value) => `${value.toFixed(2)}%`} />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {dataGrafico.map((entry, index) => (
                <cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ==========================================
  // GRÁFICO 2: EMPALME Y CAMBIO DE BASE
  // ==========================================
  if (resultado.tipo === "operaciones_indices") {
    return (
      <div className="grafico-card" style={{ width: "100%", height: "400px", padding: "20px", backgroundColor: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)", marginTop: "15px" }}>
        <h4 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-color)' }}>Evolución Histórica: Índice Original vs Nueva Base</h4>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85em', marginBottom: '20px' }}>Nota que la forma de la curva es idéntica, solo cambia la escala.</p>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={resultado.datos} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
            <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} formatter={(value) => value.toFixed(2)} />
            <Legend />
            <Line type="monotone" dataKey="indice_original" name="Índice Antiguo" stroke="var(--text-muted)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="nuevo_indice" name="Nueva Base" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ==========================================
  // GRÁFICO 3: DEFLACIÓN (LA ESTRELLA)
  // ==========================================
  if (resultado.tipo === "deflacion_financiera") {
    return (
      <div className="grafico-card" style={{ width: "100%", height: "450px", padding: "20px", backgroundColor: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-color)", marginTop: "15px" }}>
        <h4 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-color)' }}>Ilusión Monetaria: Valor Nominal vs Valor Real</h4>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85em', marginBottom: '20px' }}>Las barras muestran el dinero recibido. La línea verde muestra el poder adquisitivo real ajustado por inflación.</p>
        <ResponsiveContainer width="100%" height="80%">
          <ComposedChart data={resultado.datos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
            <XAxis dataKey="t" tick={{ fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fill: 'var(--text-muted)' }} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} formatter={(value) => `$${value.toFixed(2)}`} />
            <Legend />
            {/* El dinero que "parece" que ganamos */}
            <Bar dataKey="nominal" name="Valor Nominal (Ilusión)" fill="rgba(128, 128, 128, 0.3)" radius={[4, 4, 0, 0]} />
            {/* El poder adquisitivo real */}
            <Line type="monotone" dataKey="real" name="Valor Real (Poder Adquisitivo)" stroke="#388e3c" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 7 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}