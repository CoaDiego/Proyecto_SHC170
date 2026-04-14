import React, { useState } from 'react';
import { ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GraficoRegresion({ resultado }) {
  const mejorModelo = resultado.comparativa[0].tipoModelo;
  
  const [lineasVisibles, setLineasVisibles] = useState({
    lineal: mejorModelo === 'lineal', exponencial: mejorModelo === 'exponencial',
    logaritmica: mejorModelo === 'logaritmica', potencial: mejorModelo === 'potencial',
    reciproco: mejorModelo === 'reciproco' // <-- Añadido
  });

  const toggleLinea = (tipo) => setLineasVisibles(prev => ({ ...prev, [tipo]: !prev[tipo] }));

  const datosReales = resultado.comparativa[0].datosGrafico;
  const xVals = datosReales.map(d => d.x);
  const minX = Math.min(...xVals); const maxX = Math.max(...xVals);
  
  const datosCurvas = [];
  const pasos = 100;
  const pasoX = (maxX - minX) / pasos;
  const inicioX = minX <= 0 ? 0.001 : minX;

  for (let i = 0; i <= pasos; i++) {
    const xActual = inicioX + (i * pasoX);
    const punto = { x: xActual };
    resultado.comparativa.forEach(modelo => { punto[`y_${modelo.tipoModelo}`] = modelo.funcionPredictora(xActual); });
    datosCurvas.push(punto);
  }

  // 👇 Añadido el color para el recíproco
  const colores = { lineal: "#8884d8", exponencial: "#82ca9d", logaritmica: "#ffc658", potencial: "#ff7300", reciproco: "#d81b60" };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc', marginTop: '20px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Gráfico de Dispersión y Curvas de Ajuste</h4>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
        {['lineal', 'exponencial', 'logaritmica', 'potencial', 'reciproco'].map(tipo => {
          const existe = resultado.comparativa.some(m => m.tipoModelo === tipo);
          if (!existe) return null;
          return (
            <button key={tipo} onClick={() => toggleLinea(tipo)} style={{ padding: '4px 12px', borderRadius: '15px', border: `2px solid ${colores[tipo]}`, backgroundColor: lineasVisibles[tipo] ? colores[tipo] : 'transparent', color: lineasVisibles[tipo] ? '#fff' : colores[tipo], cursor: 'pointer', fontWeight: tipo === mejorModelo ? 'bold' : 'normal', textTransform: 'capitalize', fontSize: '0.85em' }}>
              {tipo === mejorModelo ? '⭐ ' : ''}{tipo}
            </button>
          );
        })}
      </div>

      <div style={{ width: '100%', height: 450, backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
        <ResponsiveContainer>
          <ComposedChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" vertical={true} horizontal={true} />
            <XAxis dataKey="x" type="number" domain={['auto', 'auto']} label={{ value: 'Variable X', position: 'bottom', offset: 0 }} />
            <YAxis label={{ value: 'Variable Y', angle: -90, position: 'left' }} />
            <Tooltip formatter={(value) => value.toFixed(4)} />
            <Legend wrapperStyle={{paddingTop: '20px'}} />

            <Scatter name="Datos Observados" data={datosReales} dataKey="yReal" fill="#ff0000" shape="circle" />

            {['lineal', 'exponencial', 'logaritmica', 'potencial', 'reciproco'].map(tipo => {
              if (lineasVisibles[tipo]) {
                return (
                  <React.Fragment key={tipo}>
                    <Line data={datosCurvas} type="monotone" dataKey={`y_${tipo}`} name={`Ajuste ${tipo}`} stroke={colores[tipo]} strokeWidth={2.5} dot={false} activeDot={false} legendType="line" />
                    <Scatter name={`Puntos ${tipo}`} data={datosCurvas} fill={colores[tipo]} shape="circle" size={5} legendType="none" tooltipType="none" />
                  </React.Fragment>
                );
              }
              return null;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}