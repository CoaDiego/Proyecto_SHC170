import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
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
         // Calculamos % con 2 decimales
         filaObj[catY] = totalFila > 0 ? Number(((valor / totalFila) * 100).toFixed(2)) : 0;
      } else {
         filaObj[catY] = datos.datos[catX][catY];
      }
    });
    return filaObj;
  });

  // 2. PALETA DE COLORES ACADÉMICA (Escala de Grises / Alto Contraste)
  // Igual que en tu libro: Negro para la primera serie, Gris claro para la segunda, etc.
  const colores = ["#111827", "#9ca3af", "#4b5563", "#e5e7eb"]; 

  // Configuración según tipo de gráfico
  const isStacked = tipo === "apiladas_100";
  const titulo = isStacked ? "Figura 2.14: Gráfico de Barras Apiladas (%)" : "Figura 2.13: Gráfico de Barras Agrupadas";
  const ejeYLabel = isStacked ? "Porcentaje" : "Frecuencia";

  return (
    <div style={{ width: '100%', height: 450, background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #999', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      
      <h4 style={{ textAlign: 'center', marginBottom: '25px', fontFamily: '"Times New Roman", serif', fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase' }}>
        {titulo}
      </h4>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={dataGrafico}
          margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
          barSize={isStacked ? 50 : 30} // Barras más anchas si son apiladas
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
          {/* EJE X */}
          <XAxis 
            dataKey="name" 
            tick={{ fontFamily: 'Times New Roman', fontSize: 14, fill: '#000' }} 
            axisLine={{ stroke: '#000' }}
            tickLine={{ stroke: '#000' }}
          />
          
          {/* EJE Y (Con formato de %) */}
          <YAxis 
            tick={{ fontFamily: 'Times New Roman', fontSize: 12, fill: '#000' }} 
            axisLine={{ stroke: '#000' }}
            tickLine={{ stroke: '#000' }}
            label={{ value: ejeYLabel, angle: -90, position: 'insideLeft', style: { fontFamily: 'Times New Roman', textAnchor: 'middle' } }}
            tickFormatter={(val) => isStacked ? `${val}%` : val}
            domain={isStacked ? [0, 100] : [0, 'auto']} // Forzar 0-100 en apiladas
          />
          
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ fontFamily: 'Times New Roman', border: '1px solid #000' }}
            formatter={(value, name) => [isStacked ? `${value}%` : value, name]}
          />
          
          <Legend 
            wrapperStyle={{ fontFamily: 'Times New Roman', paddingTop: '10px' }} 
            iconType="square"
          />
          
          {/* GENERACIÓN DE BARRAS */}
          {datos.columnas.map((catY, index) => (
            <Bar 
              key={catY} 
              dataKey={catY} 
              fill={colores[index % colores.length]} 
              stackId={isStacked ? "a" : undefined}
              name={catY}
            >
                {/* ETIQUETAS DE DATOS (Lo que pediste: PRECISIÓN) */}
                <LabelList 
                    dataKey={catY} 
                    position={isStacked ? "center" : "top"} 
                    style={{ 
                        fontFamily: 'Arial', 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        fill: isStacked && index === 0 ? '#fff' : '#000' // Texto blanco si el fondo es negro
                    }}
                    formatter={(val) => {
                        if (val === 0) return ""; // No mostrar ceros para limpieza
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