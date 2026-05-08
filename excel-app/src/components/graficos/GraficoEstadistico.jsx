// src/components/graficos/GraficoEstadistico.jsx
import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from "recharts";

export default function GraficoEstadistico({ datos = [], tipo = "barras" }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!Array.isArray(datos) || datos.length === 0) {
    return <p className="text-gray-500 text-sm" style={{ padding: "20px" }}>No hay datos para graficar.</p>;
  }

  // =========================================================
  // DETECCIÓN INTELIGENTE DE COLUMNAS (Para evitar pantalla blanca)
  // =========================================================
  const keys = Object.keys(datos[0] || {});
  const xKey = keys.includes('x_i') ? 'x_i' : keys[0]; 
  const yKey = keys.includes('f_i') ? 'f_i' : (keys.find(k => k.toLowerCase().includes('f_i') || k.toLowerCase().includes('frecuencia')) || keys[1]);

  // Limpiamos la fila de "Total" si existe para que no dañe el gráfico
  const datosLimpios = datos.filter(item => 
    item[xKey] !== 'Total' && item[xKey] !== 'f_i' && item[xKey] !== 'x_i' && item[xKey] !== undefined
  );

  const axisTextStyle = { fontSize: 12, fill: '#6b7280' };

  // =========================================================
  // COLORES DINÁMICOS (Tu lógica original)
  // =========================================================
  const coloresDinamicos = useMemo(() => {
    return datosLimpios.map((_, index) => {
      const hue = (index * 137.5) % 360;
      return `hsl(${hue}, 70%, 50%)`;
    });
  }, [datosLimpios]);

  // =========================================================
  // RENDERIZADO DE GRÁFICOS
  // =========================================================
  const renderChart = () => {
    switch (tipo) {
      case 'barras':
        return (
          <BarChart
            data={datosLimpios}
            margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
            barCategoryGap={2} 
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey={xKey} tick={axisTextStyle} dy={10} stroke="#000000" />
            <YAxis tick={axisTextStyle} stroke="#000000" />

            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />

            <Bar
              dataKey={yKey}
              fill="#3b82f6"
              name="Frecuencia absoluta"
              stroke="#424242"
              strokeWidth={1.5}
              radius={[2, 2, 0, 0]}
            >
              <LabelList
                dataKey={yKey}
                position="top"
                fill="var(--text-main)"
                fontSize={12}
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        );

      case 'pastel': {
        // TU LEYENDA PERSONALIZADA EN FORMA DE U
        const renderLeyendaEnU = (props) => {
          const { payload } = props;
          const total = payload.length;
          const tercio = Math.ceil(total / 3);
          const datosIzquierda = payload.slice(0, tercio);
          const datosAbajo = payload.slice(tercio, total - tercio);
          const datosDerecha = payload.slice(total - tercio, total);

          const renderItem = (entry, index) => (
            <div
              key={`legend-item-${entry.value}-${index}`}
              style={{
                display: 'flex', alignItems: 'center', cursor: 'pointer',
                opacity: activeIndex === null || activeIndex === String(entry.value) ? 1 : 0.25,
                transition: 'opacity 0.3s ease', margin: '1px 0'
              }}
              onMouseEnter={() => setActiveIndex(String(entry.value))}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div style={{ width: 12, height: 12, backgroundColor: entry.color, marginRight: 6, borderRadius: 2 }} />
              <span style={{ color: 'var(--text-main)' }}>{entry.value}</span>
            </div>
          );

          return (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              width: '100%', fontSize: '11px', marginTop: '10px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>{datosIzquierda.map(renderItem)}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 15px', flex: 1, padding: '0 10px' }}>{datosAbajo.map(renderItem)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>{datosDerecha.map(renderItem)}</div>
            </div>
          );
        };

        return (
          <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Pie
              data={datosLimpios}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={80}
              paddingAngle={2}
              labelLine={false}
              isAnimationActive={true}
              onMouseEnter={(data) => setActiveIndex(String(data.name))}
              onMouseLeave={() => setActiveIndex(null)}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }) => {
                if (percent < 0.015) return null;
                const RADIAN = Math.PI / 180;
                const sin = Math.sin(-midAngle * RADIAN);
                const cos = Math.cos(-midAngle * RADIAN);
                const sx = cx + outerRadius * cos;
                const sy = cy + outerRadius * sin;
                const mx = cx + (outerRadius + 15) * cos;
                const my = cy + (outerRadius + 15) * sin;
                const ex = mx + (cos >= 0 ? 1 : -1) * 10;
                const ey = my;
                const textAnchor = cos >= 0 ? 'start' : 'end';

                return (
                  <g>
                    <polyline points={`${sx},${sy} ${mx},${my} ${ex},${ey}`} stroke="var(--text-main)" fill="none" strokeWidth={1} />
                    <circle cx={ex} cy={ey} r={2} fill="var(--text-main)" stroke="none" />
                    <text x={ex + (cos >= 0 ? 1 : -1) * 5} y={ey} dy={4} textAnchor={textAnchor} fill="var(--text-main)" fontSize={12} fontWeight="bold">
                      {value}
                    </text>
                  </g>
                );
              }}
            >
              {datosLimpios.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={coloresDinamicos[index]}
                  stroke="var(--bg-card)"
                  strokeWidth={1}
                  style={{
                    opacity: activeIndex === null || activeIndex === String(entry[xKey]) ? 1 : 0.25,
                    transition: 'opacity 0.3s ease', cursor: 'pointer'
                  }}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
            <Legend content={renderLeyendaEnU} verticalAlign="bottom" />
          </PieChart>
        );
      }

      default:
        return <p>Tipo de gráfico no soportado.</p>;
    }
  };

  // Como MarcoWidget se encarga de contenerlo, aquí solo devolvemos el ResponsiveContainer puro
  return (
    <div style={{ width: "100%", height: "100%", minHeight: "250px", display: "flex", flexDirection: "column" }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}