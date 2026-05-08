import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

export default function GraficoBivariado({ datos, tipo }) {
  if (!datos || datos.tipo !== "distribucion_bivariada") return null;

  // 1. Lógica para el Diagrama de Dispersión
  if (tipo === "dispersion" && datos.ambosNumericos && datos.rawDataX) {
    const datosScatter = datos.rawDataX.map((x, i) => ({ x: x, y: datos.rawDataY[i] }));
    
    return (
      <div style={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column' }}>
        <p style={{ textAlign: 'center', fontFamily: 'Times New Roman', color: 'var(--text-muted)', marginBottom: '5px' }}>
          Correlación de Pearson (r) = {datos.correlacion?.toFixed(4)}
        </p>
        <ResponsiveContainer width="100%" height="90%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e0e0e0)" />
            <XAxis 
              type="number" dataKey="x" name={datos.nombreX || "Variable X"} 
              domain={['auto', 'auto']} tick={{ fill: 'var(--text-main)' }} 
            />
            <YAxis 
              type="number" dataKey="y" name={datos.nombreY || "Variable Y"} 
              domain={['auto', 'auto']} tick={{ fill: 'var(--text-main)' }} 
            />
            <ZAxis range={[60, 60]} /> 
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', borderColor: 'var(--border-color)' }} 
            />
            <Scatter name="Puntos de Dato" data={datosScatter} fill="#4b5563" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 2. Lógica para Gráficos de Barras (Agrupadas o Apiladas)
  const isStacked = tipo === "apiladas_100";
  const ejeYLabel = isStacked ? "Porcentaje" : "Frecuencia";

  const dataGrafico = datos.filas.map(catX => {
    const filaObj = { name: catX };
    datos.columnas.forEach(catY => {
      if (isStacked) {
        const totalFila = datos.totalFilas[catX];
        const valor = datos.datos[catX][catY];
        filaObj[catY] = totalFila > 0 ? Number(((valor / totalFila) * 100).toFixed(2)) : 0;
      } else {
        filaObj[catY] = datos.datos[catX][catY];
      }
    });
    return filaObj;
  });

  // Paleta de grises/azules institucionales
  const colores = ["#374151", "#60a5fa", "#9ca3af", "#3b82f6", "#d1d5db"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={dataGrafico} margin={{ top: 30, right: 30, left: 10, bottom: 20 }} barSize={isStacked ? 50 : 30}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e0e0e0)" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'var(--text-main)' }} 
          axisLine={{ stroke: 'var(--text-main)' }} 
          tickLine={{ stroke: 'var(--text-main)' }} 
        />
        <YAxis 
          tick={{ fill: 'var(--text-main)' }} 
          axisLine={{ stroke: 'var(--text-main)' }} 
          tickLine={{ stroke: 'var(--text-main)' }} 
          label={{ value: ejeYLabel, angle: -90, position: 'insideLeft', style: { fill: 'var(--text-main)' } }}
          tickFormatter={(val) => isStacked ? `${val}%` : val}
          domain={isStacked ? [0, 100] : [0, 'auto']}
        />
        <Tooltip
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
          formatter={(value, name) => [isStacked ? `${value}%` : value, name]}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />

        {datos.columnas.map((catY, index) => (
          <Bar key={catY} dataKey={catY} fill={colores[index % colores.length]} stackId={isStacked ? "a" : undefined} name={catY}>
            <LabelList
              dataKey={catY}
              position={isStacked ? "center" : "top"}
              style={{ fill: isStacked ? '#ffffff' : 'var(--text-main)', fontSize: '12px' }}
              formatter={(val) => val === 0 ? "" : (isStacked ? `${val}%` : val)}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}