import React from 'react';
import { 
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Line, Cell, ReferenceLine, ReferenceArea, Scatter 
} from 'recharts';

// --- COMPONENTE INTERNO 1: TOOLTIP PROFESIONAL PARA EL BOXPLOT ---
const BoxplotTooltip = ({ active, estadisticas }) => {
  if (active && estadisticas) {
    const hayOutliers = estadisticas.outliers && estadisticas.outliers.length > 0;
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee', color: '#2c3e50' }}>Boxplot Académico (Método Tukey)</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Límite Sup. (LSIS): <b style={{color: '#95a5a6'}}>{estadisticas.LSIS.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Max. Adyacente (Bigote): <b>{estadisticas.maxAdyacente.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Q3 (75%): <b>{estadisticas.q3.toFixed(2)}</b></p>
        <p style={{ margin: '3px 0', fontSize: '1em', color: '#e74c3c', fontWeight: 'bold' }}>Mediana: {estadisticas.mediana.toFixed(2)}</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Q1 (25%): <b>{estadisticas.q1.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Min. Adyacente (Bigote): <b>{estadisticas.minAdyacente.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Límite Inf. (LIIS): <b style={{color: '#95a5a6'}}>{estadisticas.LIIS.toFixed(2)}</b></p>
        {hayOutliers && (
          <div style={{marginTop: '5px', borderTop: '1px solid #eee', color: '#e74c3c', fontSize: '0.9em'}}>
            <b>Valores Atípicos ({estadisticas.outliers.length}):</b> {estadisticas.outliers.join(', ')}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Truco para ocultar los puntos guía y solo mostrar las líneas
const EmptyShape = () => <g></g>;

// ==========================================
// COMPONENTE PRINCIPAL EXPORTADO
// ==========================================
export default function GraficoDispersionForma({ tipo, resultado }) {
  if (!resultado || !resultado.graficos) return null;
  const { estadisticas, graficos } = resultado;

  // ------------------------------------------
  // 1. DIBUJAR BOXPLOT ACADÉMICO (Método Nativo INFALIBLE)
  // ------------------------------------------
  if (tipo === "boxplot") {
    const { absoluteMin, absoluteMax, minAdyacente, maxAdyacente, q1, mediana, q3, outliers } = estadisticas;

    // Le damos aire a los lados del gráfico para que no choque con los bordes
    const offset = (absoluteMax - absoluteMin) * 0.1;
    const minDomain = absoluteMin - offset;
    const maxDomain = absoluteMax + offset;

    // Preparamos las coordenadas matemáticas exactas de cada línea del Boxplot
    const whiskerData = [{ x: minAdyacente, y: 1 }, { x: maxAdyacente, y: 1 }];
    const leftStopperData = [{ x: minAdyacente, y: 0.8 }, { x: minAdyacente, y: 1.2 }];
    const rightStopperData = [{ x: maxAdyacente, y: 0.8 }, { x: maxAdyacente, y: 1.2 }];
    const medianData = [{ x: mediana, y: 0.7 }, { x: mediana, y: 1.3 }];
    
    // Puntos atípicos flotantes
    const outliersData = outliers ? outliers.map(o => ({ x: o, y: 1 })) : [];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
          {/* Ejes numéricos reales */}
          <XAxis type="number" dataKey="x" domain={[minDomain, maxDomain]} name="Valores" tickFormatter={tick => tick.toFixed(1)} />
          <YAxis type="number" dataKey="y" domain={[0, 2]} hide />
          
          <Tooltip content={<BoxplotTooltip estadisticas={estadisticas} />} cursor={{strokeDasharray: '3 3'}} />
          
          {/* 1. LA CAJA CENTRAL (Usa área nativa de Recharts) */}
          <ReferenceArea x1={q1} x2={q3} y1={0.7} y2={1.3} fill="rgba(52, 152, 219, 0.3)" stroke="#3498db" strokeWidth={2} />

          {/* 2. LOS BIGOTES Y LÍNEAS (Usan conexiones nativas de Scatter) */}
          <Scatter data={whiskerData} line={{ stroke: '#3498db', strokeWidth: 2 }} shape={<EmptyShape />} isAnimationActive={false} />
          <Scatter data={leftStopperData} line={{ stroke: '#3498db', strokeWidth: 2 }} shape={<EmptyShape />} isAnimationActive={false} />
          <Scatter data={rightStopperData} line={{ stroke: '#3498db', strokeWidth: 2 }} shape={<EmptyShape />} isAnimationActive={false} />
          <Scatter data={medianData} line={{ stroke: '#e74c3c', strokeWidth: 3 }} shape={<EmptyShape />} isAnimationActive={false} />

          {/* 3. VALORES ATÍPICOS (Puntos Rojos) */}
          {outliersData.length > 0 && (
            <Scatter data={outliersData} fill="#e74c3c" shape="circle" isAnimationActive={false} />
          )}
          
          {/* Truco: Punto invisible en la caja para que el Tooltip reaccione fácilmente al pasar el mouse */}
          <Scatter data={[{x: mediana, y: 1}]} fill="transparent" shape={<EmptyShape />} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // ------------------------------------------
  // 2. DIBUJAR HISTOGRAMA + CAMPANA DE GAUSS
  // ------------------------------------------
  if (tipo === "campana") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={graficos.histograma} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rango" label={{ value: 'Intervalos', position: 'insideBottom', offset: -10 }} />
          <YAxis label={{ value: 'Frecuencia (fi)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value, name) => [value.toFixed(2), name]} />
          <Bar dataKey="frecuencia" fill="#3498db" name="Frecuencia Observada" barSize={50} />
          <Line type="monotone" dataKey="curvaNormal" stroke="#e74c3c" strokeWidth={3} dot={false} name="Curva Normal Teórica" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // ------------------------------------------
  // 3. DIBUJAR DESVIACIONES (x - media)
  // ------------------------------------------
  if (tipo === "desviaciones") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={graficos.desviaciones} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="id" hide /> 
          <YAxis label={{ value: 'Distancia a la Media', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)}`, `Valor real: ${props.payload.valor}`]} />
          
          <ReferenceLine y={0} stroke="#2c3e50" strokeWidth={3} label="Media (x̄)" />
          
          <Bar dataKey="desviacion" name="Desviación de la Media">
            {graficos.desviaciones.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.desviacion > 0 ? '#2ecc71' : '#e74c3c'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
}