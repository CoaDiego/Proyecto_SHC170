import React from 'react';
import { 
  ComposedChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function GraficoTendenciaPosicion({ tipo, graficos, indicadores, isMaximized = false }) {
  if (!graficos || graficos.length === 0) return null;

  // 🔠 LETRAS Y TAMAÑOS DINÁMICOS
  const isMobile = window.innerWidth < 768;
  const fontSizeAxis = isMaximized ? (isMobile ? 12 : 14) : 11;
  const fontSizeRef = isMaximized ? (isMobile ? 18 : 24) : 18;

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

    const maxFrecuencia = Math.max(...graficos.map(g => g.frecuencia));
    const limiteEjeY = maxFrecuencia + 1;
    const ticksEjeY = [];
    for (let i = 0; i <= limiteEjeY; i += 0.5) {
      ticksEjeY.push(i);
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={graficos} margin={{ top: 35, right: 20, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="rango" stroke="var(--text-variable)" tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }} />
          <YAxis
            stroke="var(--text-variable)"
            ticks={ticksEjeY}
            domain={[0, limiteEjeY]}
            tickFormatter={(valor) => valor.toString().replace('.', ',')}
            tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }}
            label={{ value: 'Frecuencia (fi)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontWeight: 'bold' } }}
          />
          <Tooltip />
          <Bar dataKey="frecuencia" fill="#3498db" name="Frecuencia" barSize={isMaximized ? 80 : 50} />
          
          {/* Líneas verticales mostrando la posición de la Media, Mediana y Moda */}
          {indicadores && (
            <>
              <ReferenceLine x={getRangoForValue(indicadores.media)} stroke="#e74c3c" strokeDasharray="3 3" strokeWidth={isMaximized ? 3 : 2} label={{ value: 'x̄', position: 'top', fill: '#e74c3c', fontSize: fontSizeRef, fontWeight: 'bold' }} />
              <ReferenceLine x={getRangoForValue(indicadores.mediana)} stroke="#2ecc71" strokeDasharray="3 3" strokeWidth={isMaximized ? 3 : 2} label={{ value: 'Me', position: 'insideTopLeft', fill: '#2ecc71', fontSize: fontSizeRef, fontWeight: 'bold' }} />
              <ReferenceLine x={getRangoForValue(indicadores.moda)} stroke="#9b59b6" strokeDasharray="3 3" strokeWidth={isMaximized ? 3 : 2} label={{ value: 'Mo', position: 'insideTopRight', fill: '#9b59b6', fontSize: fontSizeRef, fontWeight: 'bold' }} />
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ojivaData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hasta"
            stroke="var(--text-variable)"
            tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }}
            label={{ value: 'Límite Superior del Intervalo', position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontWeight: 'bold', fill: 'var(--text-variable)' } }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="var(--text-variable)"
            tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }}
            label={{ value: 'Frecuencia Acumulada (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontWeight: 'bold', fill: 'var(--text-variable)' } }}
          />
          <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Acumulado']} />
          
          {/* La línea de la Ojiva */}
          <Line type="linear" dataKey="P_i" stroke="#e67e22" strokeWidth={isMaximized ? 5 : 3} dot={{ r: isMaximized ? 8 : 5 }} activeDot={{ r: isMaximized ? 12 : 8 }} name="Ojiva Porcentual" />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

