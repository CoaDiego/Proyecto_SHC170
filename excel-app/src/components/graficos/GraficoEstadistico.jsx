import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from "recharts";

// 👈 RECIBIMOS isMaximized AQUÍ
export default function GraficoEstadistico({ datos = [], tipo = "barras", isMaximized = false }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!Array.isArray(datos) || datos.length === 0) return <p style={{ padding: "20px" }}>No hay datos.</p>;

  const keys = Object.keys(datos[0] || {});
  const xKey = keys.includes('x_i') ? 'x_i' : keys[0]; 
  const yKey = keys.includes('f_i') ? 'f_i' : (keys.find(k => k.toLowerCase().includes('f_i') || k.toLowerCase().includes('frecuencia')) || keys[1]);

  const datosLimpios = datos.filter(item => 
    item[xKey] !== 'Total' && item[xKey] !== 'f_i' && item[xKey] !== 'x_i' && item[xKey] !== undefined
  );

  // 🔠 LETRAS DINÁMICAS: Si está maximizado, usa 18px, si no, 12px
  const fontSizeDinamico = isMaximized ? 18 : 12;
  const axisTextStyle = { fontSize: fontSizeDinamico, fill: '#6b7280' };

  const coloresDinamicos = useMemo(() => {
    return datosLimpios.map((_, index) => `hsl(${(index * 137.5) % 360}, 70%, 50%)`);
  }, [datosLimpios]);

  const renderChart = () => {
    if (tipo === 'barras') {
      return (
        <BarChart data={datosLimpios} margin={{ top: 20, right: 20, left: -20, bottom: isMaximized ? 40 : 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey={xKey} tick={axisTextStyle} dy={10} stroke="#000000" />
          <YAxis tick={axisTextStyle} stroke="#000000" />
          <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', fontSize: fontSizeDinamico }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: fontSizeDinamico }} />

          <Bar
            dataKey={yKey} fill="#3b82f6" stroke="#424242" strokeWidth={1.5} radius={[2, 2, 0, 0]}
            barSize={isMaximized ? 80 : undefined} /* 👈 BARRAS GIGANTES SI ESTÁ MAXIMIZADO */
          >
            <LabelList dataKey={yKey} position="top" fill="var(--text-main)" fontSize={fontSizeDinamico} fontWeight="bold" />
          </Bar>
        </BarChart>
      );
    }

    if (tipo === 'pastel') {
      return (
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={datosLimpios} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%"
            innerRadius={isMaximized ? 60 : 20} /* 👈 PASTEL MÁS GRUESO MAXIMIZADO */
            outerRadius={isMaximized ? 200 : 80} /* 👈 PASTEL MÁS GRANDE MAXIMIZADO */
            paddingAngle={2}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }) => {
              if (percent < 0.015) return null;
              const RADIAN = Math.PI / 180;
              const ex = cx + (outerRadius + (isMaximized ? 30 : 15)) * Math.cos(-midAngle * RADIAN);
              const ey = cy + (outerRadius + (isMaximized ? 30 : 15)) * Math.sin(-midAngle * RADIAN);
              return (
                <text x={ex} y={ey} dy={4} textAnchor={Math.cos(-midAngle * RADIAN) >= 0 ? 'start' : 'end'} fill="var(--text-main)" fontSize={fontSizeDinamico} fontWeight="bold">
                  {value}
                </text>
              );
            }}
          >
            {datosLimpios.map((entry, index) => <Cell key={`cell-${index}`} fill={coloresDinamicos[index]} /> )}
          </Pie>
          <Tooltip contentStyle={{ fontSize: fontSizeDinamico }} />
        </PieChart>
      );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
}