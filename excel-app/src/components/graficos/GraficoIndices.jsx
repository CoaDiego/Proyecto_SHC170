import React from 'react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'; // Añadimos 'Cell' aquí

export default function GraficoIndices({ resultado, isMaximized = false, selectedColumn, selectedColumnY }) {
  if (!resultado) return null;

  // 🔠 LETRAS Y TAMAÑOS DINÁMICOS
  const isMobile = window.innerWidth < 768;
  const fontSmall = isMaximized && !isMobile ? 14 : 11;
  const fontAxis = isMaximized && !isMobile ? 16 : 12;
  const fontMed = isMaximized && !isMobile ? 18 : 14;

  // ==========================================
  // GRÁFICO 1: ÍNDICES COMPUESTOS
  // ==========================================
  if (resultado.tipo === "indices_compuestos") {
    // Agregamos Edgeworth a la lista de datos del gráfico con su color morado
    const dataGrafico = [
      { nombre: 'Laspeyres', valor: resultado.resultados.laspeyres, fill: '#1976d2' },
      { nombre: 'Fisher (Ideal)', valor: resultado.resultados.fisher, fill: '#f57c00' },
      { nombre: 'Edgeworth', valor: resultado.resultados.edgeworth, fill: '#9c27b0' },
      { nombre: 'Paasche', valor: resultado.resultados.paasche, fill: '#388e3c' }
    ];

    // Para que el gráfico no empiece en 0 y se vean mejor las diferencias
    const minVal = Math.floor(Math.min(...dataGrafico.map(d => d.valor)) - 5);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
          COMPARATIVA DE ÍNDICES DE PRECIOS/CANTIDADES
        </h4>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <BarChart data={dataGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              <XAxis dataKey="nombre" tick={{ fill: 'var(--text-variable)', fontSize: fontAxis, fontWeight: 'bold' }} />
              <YAxis domain={[0, 'auto']} tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} />
              <Tooltip 
                cursor={{ fill: 'var(--border-color)', opacity: 0.3 }} 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => `${value.toFixed(2)}%`} 
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={isMaximized ? 80 : 50}>
                {dataGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRÁFICO 2: EMPALME Y CAMBIO DE BASE
  // ==========================================
  if (resultado.tipo === "operaciones_indices") {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
          EVOLUCIÓN HISTÓRICA: ÍNDICE ORIGINAL VS NUEVA BASE
        </h4>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <LineChart data={resultado.datos} margin={{ top: 20, right: 30, left: 45, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              
              <XAxis dataKey="t" tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} label={{ value: selectedColumn || 'Periodos', position: 'insideBottom', offset: -25, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} />
              <YAxis tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} domain={[0, 'auto']} label={{ value: selectedColumnY || 'Índice', angle: -90, position: 'insideLeft', offset: -30, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => value.toFixed(2)} 
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
              
              <Line type="monotone" dataKey="indice_original" name="Índice Antiguo" stroke="var(--text-muted)" strokeWidth={isMaximized ? 4 : 2} dot={{ r: isMaximized ? 5 : 3 }} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="nuevo_indice" name="Nueva Base" stroke="#1976d2" strokeWidth={isMaximized ? 5 : 3} dot={{ r: isMaximized ? 7 : 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ marginTop: '0px', padding: '5px 15px', backgroundColor: 'rgba(25, 118, 210, 0.1)', borderLeft: '4px solid #1976d2', borderRadius: '4px' }}>
          <p style={{textAlign: 'center', fontSize: fontSmall, color: 'var(--text-main)', margin: 0, fontWeight: '500'}}>
            Nota que la forma de la curva es idéntica, solo cambia la escala de medición para hacer los datos más actuales.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRÁFICO 3: DEFLACIÓN (LA ESTRELLA)
  // ==========================================
  if (resultado.tipo === "deflacion_financiera") {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
          ILUSIÓN MONETARIA: VALOR NOMINAL VS VALOR REAL
        </h4>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart data={resultado.datos} margin={{ top: 20, right: 30, left: 45, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              
              <XAxis dataKey="t" tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} label={{ value: selectedColumn || 'Periodos', position: 'insideBottom', offset: -25, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} />
              <YAxis tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} domain={[0, 'auto']} label={{ value: selectedColumnY || 'Dinero ($)', angle: -90, position: 'insideLeft', offset: -30, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => `$${value.toFixed(2)}`} 
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
              
              {/* El dinero que "parece" que ganamos */}
              <Bar dataKey="nominal" name="Valor Nominal (Ilusión)" fill="var(--border-color)" radius={[4, 4, 0, 0]} barSize={isMaximized ? 60 : 40} />
              {/* El poder adquisitivo real */}
              <Line type="monotone" dataKey="real" name="Valor Real (Poder Adquisitivo)" stroke="#388e3c" strokeWidth={isMaximized ? 5 : 4} dot={{ r: isMaximized ? 6 : 4 }} activeDot={{ r: 8 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ marginTop: '0px', padding: '5px 15px', backgroundColor: 'rgba(56, 142, 60, 0.1)', borderLeft: '4px solid #388e3c', borderRadius: '4px' }}>
          <p style={{textAlign: 'center', fontSize: fontSmall, color: 'var(--text-main)', margin: 0, fontWeight: '500'}}>
            Las barras muestran el dinero recibido. La línea verde muestra el verdadero poder adquisitivo ajustado por inflación.
          </p>
        </div>
      </div>
    );
  }

  return null;
}