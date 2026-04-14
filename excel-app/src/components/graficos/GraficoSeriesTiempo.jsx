import React from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area
} from 'recharts';

export default function GraficoSeriesTiempo({ resultado }) {
  // Los datos ya vienen listos desde el motor (resultado.datos)
  const datosGrafico = resultado.datos;

  return (
    <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h4 style={{ textAlign: 'center', color: 'var(--text-color)', marginBottom: '15px' }}>
        Comparativa: Datos Reales vs Pronóstico ({resultado.metodo.replace('_', ' ')})
      </h4>

      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <ComposedChart data={datosGrafico} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            {/* Cuadrícula adaptativa */}
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" vertical={false} />
            
            {/* Eje X: Mostramos las etiquetas de tiempo (Meses/Años) */}
            <XAxis dataKey="xLabel" tick={{fill: 'var(--text-muted)'}} />
            
            {/* Eje Y: Valores numéricos */}
            <YAxis tick={{fill: 'var(--text-muted)'}} />
            
            <Tooltip 
              contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-color)'}}
              formatter={(value, name) => [value.toFixed(2), name === 'yReal' ? 'Valor Real' : 'Pronóstico']}
              labelStyle={{fontWeight: 'bold', color: 'var(--primary-color)'}}
            />
            
            <Legend wrapperStyle={{ paddingTop: '10px' }} />

            {/* 1. Línea de Datos Reales (Sólida) */}
            <Line 
              type="monotone" 
              dataKey="yReal" 
              name="Valor Real" 
              stroke="#1976d2" // Azul
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />

            {/* 2. Línea de Pronóstico (Punteada o de otro color) */}
            <Line 
              type="monotone" 
              dataKey="yPronostico" 
              name="Pronóstico" 
              stroke="#ff9800" // Naranja
              strokeWidth={3} 
              strokeDasharray="5 5" // Línea punteada para diferenciar que es una estimación
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6 }}
              connectNulls={true} // Importante: para que la línea no se corte si los primeros meses no tienen pronóstico
            />

            {/* Opcional: Un área suave debajo de la línea real para darle mejor aspecto */}
            <Area type="monotone" dataKey="yReal" fill="#1976d2" fillOpacity={0.1} stroke="none" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <p style={{marginTop: '10px', fontSize: '0.85em', color: 'var(--text-muted)', textAlign: 'center'}}>
        Nota: La línea punteada naranja representa la predicción del modelo seleccionado. Cuanto más se superponga a la línea azul, mejor es el ajuste.
      </p>
    </div>
  );
}