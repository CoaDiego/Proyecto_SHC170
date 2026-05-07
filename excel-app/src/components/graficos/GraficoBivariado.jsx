import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
  ScatterChart, Scatter, ZAxis // 🆕 Importamos lo necesario para el diagrama de dispersión
} from 'recharts';

import "../../styles/components/graficos/GraficoBivariado.css";

export default function GraficoBivariado({ datos, tipo }) {
  // ⚙️ FIX: Actualizamos el nombre al nuevo identificador unificado
  if (!datos || datos.tipo !== "distribucion_bivariada") return null;

  // 1. Transformación para Gráfico de Barras
  const dataGrafico = datos.filas.map(catX => {
    const filaObj = { name: catX };
    datos.columnas.forEach(catY => {
      if (tipo === "apiladas_100") {
        const totalFila = datos.totalFilas[catX];
        const valor = datos.datos[catX][catY];
        filaObj[catY] = totalFila > 0 ? Number(((valor / totalFila) * 100).toFixed(2)) : 0;
      } else {
        filaObj[catY] = datos.datos[catX][catY];
      }
    });
    return filaObj;
  });

  // 2. Transformación para Gráfico de Dispersión (Solo si hay números)
  const datosScatter = useMemo(() => {
    if (!datos.ambosNumericos || !datos.rawDataX) return [];
    return datos.rawDataX.map((x, i) => ({ x: x, y: datos.rawDataY[i] }));
  }, [datos]);

  const colores = ["#374151", "#9ca3af", "#6b7280", "#d1d5db"];

  const isStacked = tipo === "apiladas_100";
  const titulo = isStacked ? "Figura 2.14: Gráfico de Barras Apiladas (%)" : "Figura 2.13: Gráfico de Barras Agrupadas";
  const ejeYLabel = isStacked ? "Porcentaje" : "Frecuencia";

  return (
    <div className='container_bivariado'>
      
      {/* ================= GRÁFICO DE BARRAS ================= */}
      <div style={{ marginBottom: datos.ambosNumericos ? '50px' : '0' }}>
        <h4 style={{ fontFamily: 'Times New Roman' }}>{titulo}</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={dataGrafico}
            margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
            barSize={isStacked ? 50 : 30}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />

            <XAxis
              dataKey="name"
              tick={{ fontFamily: 'Times New Roman', fontSize: 14, fill: 'var(--text-main)' }}
              axisLine={{ stroke: 'var(--text-main)' }}
              tickLine={{ stroke: 'var(--text-main)' }}
            />

            <YAxis
              tick={{ fontFamily: 'Times New Roman', fontSize: 12, fill: 'var(--text-main)' }}
              axisLine={{ stroke: 'var(--text-main)' }}
              tickLine={{ stroke: 'var(--text-main)' }}
              label={{
                value: ejeYLabel,
                angle: -90,
                position: 'insideLeft',
                style: { fontFamily: 'Times New Roman', textAnchor: 'middle', fill: 'var(--text-main)' }
              }}
              tickFormatter={(val) => isStacked ? `${val}%` : val}
              domain={isStacked ? [0, 100] : [0, 'auto']}
            />

            <Tooltip
              cursor={{ fill: 'var(--bg-input)' }}
              contentStyle={{
                fontFamily: 'Times New Roman',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)'
              }}
              itemStyle={{ color: 'var(--text-main)' }}
              formatter={(value, name) => [isStacked ? `${value}%` : value, name]}
            />

            <Legend
              wrapperStyle={{ fontFamily: 'Times New Roman', paddingTop: '10px' }}
              iconType="square"
            />

            {datos.columnas.map((catY, index) => (
              <Bar
                key={catY}
                dataKey={catY}
                fill={colores[index % colores.length]}
                stackId={isStacked ? "a" : undefined}
                name={catY}
              >
                <LabelList
                  dataKey={catY}
                  position={isStacked ? "center" : "top"}
                  className='container_bivariado_label'
                  style={{
                    fontFamily: 'Times New Roman',
                    fill: isStacked ? '#fff' : 'var(--text-main)'
                  }}
                  formatter={(val) => {
                    if (val === 0) return "";
                    return isStacked ? `${val}%` : val;
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= GRÁFICO DE DISPERSIÓN (Automático) ================= */}
      {datos.ambosNumericos && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontFamily: 'Times New Roman' }}>Figura 2.15: Diagrama de Dispersión</h4>
          <p style={{ textAlign: 'center', fontFamily: 'Times New Roman', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Correlación (r) = {datos.correlacion?.toFixed(4)}
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={datos.nombreX || "Variable X"} 
                domain={['auto', 'auto']} 
                tick={{ fontFamily: 'Times New Roman', fill: 'var(--text-main)' }} 
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={datos.nombreY || "Variable Y"} 
                domain={['auto', 'auto']} 
                tick={{ fontFamily: 'Times New Roman', fill: 'var(--text-main)' }} 
              />
              <ZAxis range={[50, 50]} /> {/* Tamaño de los puntos */}
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ fontFamily: 'Times New Roman', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} 
              />
              <Scatter name="Datos" data={datosScatter} fill="#4b5563" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}