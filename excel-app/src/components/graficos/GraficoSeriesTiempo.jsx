import React from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function GraficoSeriesTiempo({ resultado, tipo }) {
  if (!resultado || resultado.tipo !== "series_tiempo") return null;

  // Extraemos los datos calculados de nuestro motor
  const datos = resultado.datos;

  // GRÁFICO 1: LÍNEA DE TENDENCIA (Real vs Pronóstico)
  if (tipo === "historico") {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-color)' }}>
          Modelo de {resultado.metodo.replace(/_/g, ' ')}
        </h4>
        <div style={{ flexGrow: 1, minHeight: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={datos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" vertical={false} />
              <XAxis dataKey="xLabel" tick={{fill: 'var(--text-muted)'}} />
              <YAxis tick={{fill: 'var(--text-muted)'}} />
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-color)'}}
                formatter={(value) => value !== null ? value.toFixed(2) : 'N/A'}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              {/* Línea Sólida: Datos Reales */}
              <Line 
                type="monotone" dataKey="yReal" name="Dato Real (Y)" 
                stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} 
              />
              {/* Línea Punteada: Pronóstico */}
              <Line 
                type="monotone" dataKey="yPronostico" name="Pronóstico (F)" 
                stroke="#ff9800" strokeWidth={3} strokeDasharray="5 5" 
                dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={true} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p style={{textAlign: 'center', fontSize: '0.8em', color: 'var(--text-muted)', margin: '10px 0 0 0'}}>
          La línea naranja representa la predicción. Cuanto más se superponga a la azul, más exacto es el modelo.
        </p>
      </div>
    );
  }

  // GRÁFICO 2: BARRAS DE ERROR (Residuos)
  if (tipo === "pronostico") {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-color)' }}>
          Análisis de Errores (Residuos)
        </h4>
        <div style={{ flexGrow: 1, minHeight: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={datos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" vertical={false} />
              <XAxis dataKey="xLabel" tick={{fill: 'var(--text-muted)'}} />
              <YAxis tick={{fill: 'var(--text-muted)'}} />
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-color)'}}
                formatter={(value) => value !== null ? value.toFixed(4) : 'N/A'}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              
              {/* Línea Cero (Eje central) */}
              <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={2} />
              
              {/* Barras de Error */}
              <Bar 
                dataKey="error" name="Error (Real - Pronóstico)" 
                fill="#f44336" radius={[4, 4, 0, 0]} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p style={{textAlign: 'center', fontSize: '0.8em', color: 'var(--text-muted)', margin: '10px 0 0 0'}}>
          Las barras rojas indican qué tanto falló el modelo en cada periodo. Idealmente deben estar cerca de cero.
        </p>
      </div>
    );
  }

  return null;
}