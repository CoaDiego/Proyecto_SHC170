import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

export default function GraficoBivariado({ datos, tipo }) {
  if (!datos || datos.tipo !== "bivariada") return null;

  // 1. PREPARAR DATOS
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

  // 2. PALETA DE COLORES (Adaptada para Modo Oscuro/Claro)
  // Usamos colores que contrasten bien en ambos fondos.
  const colores = ["#374151", "#9ca3af", "#6b7280", "#d1d5db"]; 
  // Nota: Si quieres que el "negro" cambie a "blanco" en modo oscuro, podrías usar CSS variables para el fill,
  // pero Recharts prefiere hex. Estos grises medios funcionan decentemente en ambos.

  const isStacked = tipo === "apiladas_100";
  const titulo = isStacked ? "Figura 2.14: Gráfico de Barras Apiladas (%)" : "Figura 2.13: Gráfico de Barras Agrupadas";
  const ejeYLabel = isStacked ? "Porcentaje" : "Frecuencia";

  return (
    <div style={{ 
        width: '100%', 
        height: 450, 
        // CAMBIO AQUÍ: Variables CSS
        background: 'var(--bg-card)', 
        color: 'var(--text-main)',
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color)', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
    }}>
      
      <h4 style={{ 
          textAlign: 'center', 
          marginBottom: '25px', 
          fontFamily: '"Times New Roman", serif', 
          fontSize: '1.1em', 
          fontWeight: 'bold', 
          textTransform: 'uppercase',
          color: 'var(--text-main)' // CAMBIO
      }}>
        {titulo}
      </h4>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={dataGrafico}
          margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
          barSize={isStacked ? 50 : 30}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
          
          {/* EJE X */}
          <XAxis 
            dataKey="name" 
            tick={{ fontFamily: 'Times New Roman', fontSize: 14, fill: 'var(--text-main)' }} 
            axisLine={{ stroke: 'var(--text-main)' }}
            tickLine={{ stroke: 'var(--text-main)' }}
          />
          
          {/* EJE Y */}
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
                    style={{ 
                        fontFamily: 'Arial', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        // Ajustamos el color del texto dentro de la barra para que contraste
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
  );
}