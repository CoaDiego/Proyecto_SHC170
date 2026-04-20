import React from 'react';
import { 
  ComposedChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function GraficoTendenciaPosicion({ tipo, graficos, indicadores }) {
  if (!graficos || graficos.length === 0) return null;

  // ------------------------------------------
  // 1. HISTOGRAMA CON LÍNEAS DE TENDENCIA
  // ------------------------------------------
  if (tipo === "histograma_tendencia") {
    // Buscamos a qué etiqueta de "rango" pertenece la media, mediana y moda
    // para que Recharts sepa dónde pintar exactamente la línea vertical
    const getRangoForValue = (val) => {
      const match = graficos.find(g => val >= g.desde && val <= g.hasta);
      return match ? match.rango : graficos[0].rango;
    };

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={graficos} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rango" />
          <YAxis label={{ value: 'Frecuencia (fi)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="frecuencia" fill="#3498db" name="Frecuencia" barSize={50} />
          
          {/* Líneas verticales mostrando la posición de la Media, Mediana y Moda */}
          {indicadores && (
            <>
              <ReferenceLine x={getRangoForValue(indicadores.media)} stroke="#e74c3c" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'x̄', position: 'top', fill: '#e74c3c', fontSize: 18 }} />
              <ReferenceLine x={getRangoForValue(indicadores.mediana)} stroke="#2ecc71" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'Me', position: 'insideTopLeft', fill: '#2ecc71', fontSize: 18 }} />
              <ReferenceLine x={getRangoForValue(indicadores.moda)} stroke="#9b59b6" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'Mo', position: 'insideTopRight', fill: '#9b59b6', fontSize: 18 }} />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // ------------------------------------------
  // 2. GRÁFICO DE OJIVA (Frecuencias Acumuladas)
  // ------------------------------------------
  if (tipo === "ojiva") {
    // Agregamos un punto de inicio en 0 para que la ojiva nazca desde abajo (eje X)
    const ojivaData = [
      { hasta: graficos[0].desde, P_i: 0 }, // Punto de anclaje inicial
      ...graficos
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={ojivaData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hasta" label={{ value: 'Límite Superior del Intervalo', position: 'insideBottom', offset: -10 }} />
          <YAxis domain={[0, 100]} label={{ value: 'Frecuencia Acumulada (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Acumulado']} />
          
          {/* La línea de la Ojiva */}
          <Line type="linear" dataKey="P_i" stroke="#e67e22" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Ojiva Porcentual" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
}